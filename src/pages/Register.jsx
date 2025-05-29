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
    role: "admin", // default for now
    gender: "Male",
  });

  const handleRegister = async () => {
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
        isNew: true,
        createdAt: new Date(),
        age: 0,
        address: "missing",
        orderid: [],
      });

      alert("Registration successful");
      navigate("/login");
    } catch (err) {
      console.error("Registration Error:", err);
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <input placeholder="Phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <select onChange={(e) => setForm({ ...form, gender: e.target.value })}>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>
      <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleRegister}>Register</button>
      <p>
        Already have an account?{" "}
        <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate("/login")}>Login</span>
      </p>
    </div>
  );
}
