import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";

const DeliveryGuys = () => {
  const [deliveryGuys, setDeliveryGuys] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    gender: "Male",
    profile_image: "",
  });

  // Fetch delivery guys from Firestore
  const fetchDeliveryGuys = async () => {
    const snap = await getDocs(query(collection(db, "deliveryGuys"), orderBy("id", "asc")));
    const data = snap.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));
    setDeliveryGuys(data);
  };

  useEffect(() => {
    fetchDeliveryGuys();
  }, []);

  const addDeliveryGuy = async () => {
    const newId = deliveryGuys.length > 0 ? deliveryGuys[deliveryGuys.length - 1].id + 1 : 501;
    const docId = `deliveryGuy-${newId}`;
    const newGuy = {
      id: newId,
      ...form,
      orders_assigned: [],
    };

    await setDoc(doc(db, "deliveryGuys", docId), newGuy);
    setForm({
      name: "",
      phone_number: "",
      gender: "Male",
      profile_image: "",
    });
    fetchDeliveryGuys();
  };

  // Delete a delivery guy
  const deleteDeliveryGuy = async (docId) => {
    await deleteDoc(doc(db, "deliveryGuys", docId));
    fetchDeliveryGuys();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Delivery Guy</h2>
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Phone Number"
        value={form.phone_number}
        onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
      />
      <input
        placeholder="Profile Image URL"
        value={form.profile_image}
        onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
      />
      <select
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <button onClick={addDeliveryGuy}>Add Delivery Guy</button>

      <hr />

      <h2>All Delivery Guys</h2>
      {[...deliveryGuys].reverse().map((guy) => (
        <div key={guy.docId} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <img src={guy.profile_image} alt="Profile" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "50%" }} />
          <p><strong>{guy.name}</strong> ({guy.gender})</p>
          <p>📞 {guy.phone_number}</p>
          <p>🛵 Orders Assigned: {guy.orders_assigned?.length || 0}</p>
          <button style={{ color: "red" }} onClick={() => deleteDeliveryGuy(guy.docId)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default DeliveryGuys;