import "./Register.css";
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
    <div className="register-container">
      <h2>Create Account</h2>
      
      <div className="register-form">
        <div className="form-group full-width">
          <input 
            placeholder="Full Name" 
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="form-group full-width">
          <input 
            placeholder="Email Address" 
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="form-group full-width">
          <input 
            placeholder="Password (min 6 characters)" 
            type="password" 
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <input 
              placeholder="Phone Number" 
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input 
              placeholder="Age" 
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group full-width">
          <input 
            placeholder="Full Address" 
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <select 
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              disabled={loading}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <select 
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              disabled={loading}
            >
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button 
          className={`register-button ${loading ? 'loading' : ''}`} 
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </div>

      <p className="login-link">
        Already have an account?{" "}
        <span onClick={() => navigate("/login")}>Login</span>
      </p>
    </div>
  );
}