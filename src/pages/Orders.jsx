import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryGuys, setDeliveryGuys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    product_name: '',
    product_description: '',
    category: '',
    amount: '',
    image: '',
    delivery_boy_id: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const orderSnap = await getDocs(query(collection(db, 'orders'), orderBy('id', 'asc')));
      const guySnap = await getDocs(collection(db, 'deliveryGuys'));
      setOrders(orderSnap.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
      setDeliveryGuys(guySnap.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchData();
  }, []);

  const addOrder = async () => {
    const newId = `order-${orders.length + 1}`;
    const order = {
      ...form,
      id: orders.length + 1,
      user_id: 999,
      delivery_boy_id: form.delivery_boy_id ? parseInt(form.delivery_boy_id) : null,
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      status: form.delivery_boy_id ? 'assigned' : 'pending'
    };

    await setDoc(doc(db, 'orders', newId), order);
    if (order.delivery_boy_id) {
      const ref = doc(db, 'deliveryGuys', `deliveryGuy-${order.delivery_boy_id}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const assigned = snap.data().orders_assigned || [];
        await updateDoc(ref, { orders_assigned: [...assigned, order.id] });
      }
    }
    setForm({ ...form, product_name: '', product_description: '', category: '', amount: '', image: '', delivery_boy_id: '', address: { street: '', city: '', state: '', pincode: '', coordinates: { latitude: '', longitude: '' } } });
    const orderSnap = await getDocs(query(collection(db, 'orders'), orderBy('id', 'asc')));
    setOrders(orderSnap.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
  };

  const deleteOrder = async (docId, id, guyId) => {
    if (guyId) {
      const ref = doc(db, 'deliveryGuys', `deliveryGuy-${guyId}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const updated = (snap.data().orders_assigned || []).filter(orderId => orderId !== id);
        await updateDoc(ref, { orders_assigned: updated });
      }
    }
    await deleteDoc(doc(db, 'orders', docId));
    setOrders(orders.filter(order => order.docId !== docId));
  };

  const assignDeliveryGuy = async (docId, newGuyIdStr) => {
    const newGuyId = parseInt(newGuyIdStr);
    const orderRef = doc(db, 'orders', docId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return;
    const order = orderSnap.data();

    if (order.delivery_boy_id) {
      const oldRef = doc(db, 'deliveryGuys', `deliveryGuy-${order.delivery_boy_id}`);
      const oldSnap = await getDoc(oldRef);
      if (oldSnap.exists()) {
        const updated = (oldSnap.data().orders_assigned || []).filter(id => id !== order.id);
        await updateDoc(oldRef, { orders_assigned: updated });
      }
    }

    const newRef = doc(db, 'deliveryGuys', `deliveryGuy-${newGuyId}`);
    const newSnap = await getDoc(newRef);
    if (newSnap.exists()) {
      const updated = [...new Set([...(newSnap.data().orders_assigned || []), order.id])];
      await updateDoc(newRef, { orders_assigned: updated });
    }

    await updateDoc(orderRef, { delivery_boy_id: newGuyId, status: 'assigned' });
    const updatedOrders = orders.map(o => o.docId === docId ? { ...o, delivery_boy_id: newGuyId, status: 'assigned' } : o);
    setOrders(updatedOrders);
  };

  const getDeliveryGuyName = (id) => deliveryGuys.find(g => g.id === id)?.name || 'Unassigned';

  if (loading) return <div className="flex items-center justify-center h-screen text-primary">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white p-8">
      {/* Header */}
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-teal-400 hover:text-teal-600 transition"
          aria-label="Go back"
        >
          <ChevronLeft size={32} />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-teal-400">📦 Order Management</h1>
          <p className="text-gray-400 mt-1">Create and track delivery orders with ease</p>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">

        {/* Create Order */}
        <section className="bg-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col overflow-y-auto max-h-full animate-fadeIn">
          <h2 className="text-2xl font-semibold text-teal-400 mb-6">✨ Create Order</h2>
          <div className="flex flex-col gap-4">
            {[
              { placeholder: "Product Name", value: form.product_name, key: "product_name" },
              { placeholder: "Description", value: form.product_description, key: "product_description" },
              { placeholder: "Category", value: form.category, key: "category" },
              { placeholder: "Amount ₹", value: form.amount, key: "amount", type: "number" },
              { placeholder: "Image URL", value: form.image, key: "image" },
            ].map(({ placeholder, value, key, type }) => (
              <input
                key={key}
                type={type || "text"}
                className="bg-gray-700 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={placeholder}
                value={value}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
              />
            ))}

            <select
              className="bg-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.delivery_boy_id}
              onChange={e => setForm({ ...form, delivery_boy_id: e.target.value })}
            >
              <option value="">Assign Delivery Guy</option>
              {deliveryGuys.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Street", key: "street" },
                { label: "City", key: "city" },
                { label: "State", key: "state" },
                { label: "Pincode", key: "pincode" },
                { label: "Latitude", key: "latitude", coord: true },
                { label: "Longitude", key: "longitude", coord: true },
              ].map(({ label, key, coord }) => (
                <input
                  key={key}
                  placeholder={label}
                  className="bg-gray-700 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={
                    coord
                      ? form.address.coordinates[key]
                      : form.address[key]
                  }
                  onChange={(e) => {
                    if (coord) {
                      setForm({
                        ...form,
                        address: {
                          ...form.address,
                          coordinates: {
                            ...form.address.coordinates,
                            [key]: e.target.value,
                          },
                        },
                      });
                    } else {
                      setForm({
                        ...form,
                        address: {
                          ...form.address,
                          [key]: e.target.value,
                        },
                      });
                    }
                  }}
                />
              ))}
            </div>

            <button
              onClick={addOrder}
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-black font-semibold py-3 rounded-lg transition duration-300"
            >
              ➕ Create Order
            </button>
          </div>
        </section>

        {/* Order List */}
        <section className="bg-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          <h2 className="text-2xl font-semibold text-teal-400 mb-6">📋 Orders ({orders.length})</h2>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-full">
            {orders.length === 0 ? (
              <p className="text-gray-400">No orders yet.</p>
            ) : (
              orders.slice().reverse().map(order => (
                <div key={order.docId} className="bg-gray-700 rounded-xl p-4 shadow-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">{order.product_name}</span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${order.status === "assigned"
                        ? "bg-green-400 text-black"
                        : "bg-red-400 text-black"
                        }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-300">₹{order.amount}</div>
                  <div className="text-sm text-gray-300">
                    Assigned to: {getDeliveryGuyName(order.delivery_boy_id)}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={order.delivery_boy_id || ''}
                      onChange={(e) => assignDeliveryGuy(order.docId, e.target.value)}
                      className="bg-gray-800 text-white px-2 py-1 text-sm rounded focus:outline-none"
                    >
                      <option value="">Assign</option>
                      {deliveryGuys.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <button
                      onClick={() => deleteOrder(order.docId, order.id, order.delivery_boy_id)}
                      className="text-red-400 hover:text-red-300 transition text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Orders;