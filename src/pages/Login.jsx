import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      console.log(res.user);
      const user = res.user;

      // Get user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setError("User not found in database.");
        return;
      }

      const userData = userDoc.data();

      // Check if the role is admin
      if (userData.role !== "admin") {
        setError("Access denied. You are not an admin.");
        return;
      }

      // Save token and redirect
      const token = await user.getIdToken();
      localStorage.setItem("token", token);
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl space-y-6 animate-fadeIn">
        <h2 className="text-3xl font-bold text-center text-indigo-400">Admin Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold bg-indigo-500 hover:bg-indigo-600 transition duration-300"
          >
            Login
          </button>
        </form>

        {error && <p className="text-red-400 text-center text-sm">{error}</p>}

        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-400 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}