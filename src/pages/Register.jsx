// import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "admin",
    gender: "Male",
    age: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    
    if (!form.name || !form.email || !form.password || !form.phone || !form.age || !form.address) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (form.age < 1 || form.age > 120) {
      setError("Please enter a valid age");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        role: form.role,
        age: parseInt(form.age),
        address: form.address,
        isNew: true,
        createdAt: new Date(),
        orderid: [],
      });

      alert("Registration successful");
      navigate("/login");
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4">
    <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-center text-teal-400">Create Delivery Account</h2>

      <div className="space-y-4">
        <input 
          placeholder="Full Name"
          className="w-full px-4 py-3 rounded-xl bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={loading}
        />

        <input 
          placeholder="Email Address" 
          type="email"
          className="w-full px-4 py-3 rounded-xl bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={loading}
        />

        <input 
          placeholder="Password (min 6 characters)" 
          type="password" 
          className="w-full px-4 py-3 rounded-xl bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          disabled={loading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input 
            placeholder="Phone Number" 
            type="tel"
            className="w-full px-4 py-3 rounded-xl bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={loading}
          />

          <input 
            placeholder="Age" 
            type="number"
            min="1"
            max="120"
            className="w-full px-4 py-3 rounded-xl bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            disabled={loading}
          />
        </div>

        <input 
          placeholder="Full Address"
          className="w-full px-4 py-3 rounded-xl bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          disabled={loading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            disabled={loading}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            disabled={loading}
          >
            <option value="admin">Admin</option>
          </select>
        </div>

        {error && (
          <div className="text-red-400 text-sm mt-2 text-center">
            {error}
          </div>
        )}

        <button
          className={`w-full py-3 rounded-xl font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-all duration-300 ${
            loading && 'opacity-60 cursor-not-allowed'
          }`}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </div>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-teal-400 cursor-pointer hover:underline"
        >
          Login
        </span>
      </p>
    </div>
  </div>
);

}