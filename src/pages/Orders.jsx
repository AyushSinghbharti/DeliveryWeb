import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [deliveryGuys, setDeliveryGuys] = useState([]);
  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    category: "",
    amount: 0,
    image: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      coordinates: { latitude: 0, longitude: 0 },
    },
  });

  const fetchOrders = async () => {
    const snapshot = await getDocs(collection(db, "orders"));
    setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchDeliveryGuys = async () => {
    const snapshot = await getDocs(collection(db, "deliveryGuys"));
    setDeliveryGuys(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleCreateOrder = async () => {
    await addDoc(collection(db, "orders"), {
      ...form,
      order_date: new Date().toISOString().split("T")[0],
      delivery_date: "",
      user_id: 0,
      delivery_boy_id: 0,
      status: "pending",
    });
    setForm({ ...form, product_name: "", product_description: "", amount: 0 });
    fetchOrders();
  };

  const assignDeliveryGuy = async (orderId, deliveryGuyId) => {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      delivery_boy_id: deliveryGuyId,
      status: "assigned",
    });
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryGuys();
  }, []);

  return (
    <div>
      <h2>Orders</h2>

      <div>
        <h4>Create New Order</h4>
        <input placeholder="Product Name" onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
        <input placeholder="Description" onChange={(e) => setForm({ ...form, product_description: e.target.value })} />
        <input placeholder="Category" onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input type="number" placeholder="Amount" onChange={(e) => setForm({ ...form, amount: +e.target.value })} />
        <input placeholder="Image URL" onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <button onClick={handleCreateOrder}>Create Order</button>
      </div>

      <h4>All Orders</h4>
      {orders.map((order) => (
        <div key={order.id} style={{ border: "1px solid gray", marginBottom: "10px" }}>
          <p><b>{order.product_name}</b> — ₹{order.amount}</p>
          <p>Status: {order.status}</p>
          <select onChange={(e) => assignDeliveryGuy(order.id, e.target.value)} value={order.delivery_boy_id || ""}>
            <option value="">Assign Delivery Guy</option>
            {deliveryGuys.map((guy) => (
              <option key={guy.id} value={guy.id}>{guy.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
