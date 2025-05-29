import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

export default function DeliveryGuys() {
  const [deliveryGuys, setDeliveryGuys] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    gender: "Male",
    profile_image: "",
  });

  const fetchDeliveryGuys = async () => {
    const snapshot = await getDocs(collection(db, "deliveryGuys"));
    setDeliveryGuys(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleCreate = async () => {
    await addDoc(collection(db, "deliveryGuys"), {
      ...form,
      orders_assigned: [],
    });
    setForm({
      name: "",
      email: "",
      phone_number: "",
      gender: "Male",
      profile_image: "",
    });
    fetchDeliveryGuys();
  };

  useEffect(() => {
    fetchDeliveryGuys();
  }, []);

  return (
    <div>
      <h2>Delivery Guys</h2>

      <div>
        <h4>Add New Delivery Guy</h4>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
        />
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          placeholder="Profile Image URL"
          value={form.profile_image}
          onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
        />
        <button onClick={handleCreate}>Create</button>
      </div>

      <h4>All Delivery Guys</h4>
      {deliveryGuys.map((guy) => (
        <div key={guy.id} style={{ border: "1px solid gray", marginBottom: "10px" }}>
          <img src={guy.profile_image} alt={guy.name} width="50" height="50" />
          <p><b>{guy.name}</b> ({guy.gender})</p>
          <p>Email: {guy.email}</p>
          <p>Phone: {guy.phone_number}</p>
          <p>Assigned Orders: {guy.orders_assigned?.length || 0}</p>
        </div>
      ))}
    </div>
  );
}
