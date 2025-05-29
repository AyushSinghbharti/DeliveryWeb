// Orders.jsx
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryGuys, setDeliveryGuys] = useState([]);
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

  const fetchOrders = async () => {
    const orderSnapshot = await getDocs(query(collection(db, 'orders'), orderBy('id', 'asc')));
    const orderData = orderSnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    setOrders(orderData);
  };

  const fetchDeliveryGuys = async () => {
    const snapshot = await getDocs(collection(db, 'deliveryGuys'));
    const data = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    setDeliveryGuys(data);
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryGuys();
  }, []);

  const addOrder = async () => {
    const orderId = `order-${parseInt(orders[orders.length - 1].docId.slice(-2)) + 1}`;
    const newOrder = {
      ...form,
      id: orders.length + 1,
      user_id: 999,
      delivery_boy_id: form.delivery_boy_id ? parseInt(form.delivery_boy_id) : null,
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      status: 'assigned'
    };

    await setDoc(doc(db, 'orders', orderId), newOrder);

    if (newOrder.delivery_boy_id) {
      const guyDocId = `deliveryGuy-${newOrder.delivery_boy_id}`;
      const guyRef = doc(db, 'deliveryGuys', guyDocId);
      const guySnap = await getDoc(guyRef);
      if (guySnap.exists()) {
        const assigned = guySnap.data().orders_assigned || [];
        await updateDoc(guyRef, {
          orders_assigned: [...assigned, newOrder.id]
        });
      }
    }

    window.location.reload();
  };

  const deleteOrder = async (docId, numericId, deliveryBoyId) => {
    if (deliveryBoyId) {
      const guyDocId = `deliveryGuy-${deliveryBoyId}`;
      const guyRef = doc(db, 'deliveryGuys', guyDocId);
      const guySnap = await getDoc(guyRef);
      if (guySnap.exists()) {
        const orders = guySnap.data().orders_assigned || [];
        await updateDoc(guyRef, {
          orders_assigned: orders.filter(id => id !== numericId)
        });
      }
    }

    await deleteDoc(doc(db, 'orders', docId));
    window.location.reload();
  };

  const assignDeliveryGuy = async (orderDocId, newGuyIdStr) => {
    const newGuyId = parseInt(newGuyIdStr);
    const orderRef = doc(db, 'orders', orderDocId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return;

    const orderData = orderSnap.data();
    const orderNumericId = orderData.id;
    const oldGuyId = orderData.delivery_boy_id;

    if (oldGuyId) {
      const oldGuyRef = doc(db, 'deliveryGuys', `deliveryGuy-${oldGuyId}`);
      const oldGuySnap = await getDoc(oldGuyRef);
      if (oldGuySnap.exists()) {
        const assigned = oldGuySnap.data().orders_assigned || [];
        await updateDoc(oldGuyRef, {
          orders_assigned: assigned.filter(id => id !== orderNumericId)
        });
      }
    }

    const newGuyRef = doc(db, 'deliveryGuys', `deliveryGuy-${newGuyId}`);
    const newGuySnap = await getDoc(newGuyRef);
    if (newGuySnap.exists()) {
      const assigned = newGuySnap.data().orders_assigned || [];
      await updateDoc(newGuyRef, {
        orders_assigned: [...new Set([...assigned, orderNumericId])]
      });
    }

    await updateDoc(orderRef, {
      delivery_boy_id: newGuyId,
      status: 'assigned'
    });

    window.location.reload();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create New Order</h2>
      <input placeholder="Product Name" onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
      <input placeholder="Description" onChange={(e) => setForm({ ...form, product_description: e.target.value })} />
      <input placeholder="Category" onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <input placeholder="Amount" type="number" onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })} />
      <input placeholder="Image URL" onChange={(e) => setForm({ ...form, image: e.target.value })} />
      <h4>Address</h4>
      <input placeholder="Street" onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} />
      <input placeholder="City" onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
      <input placeholder="State" onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
      <input placeholder="Pincode" onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} />
      <input placeholder="Latitude" onChange={(e) => setForm({ ...form, address: { ...form.address, coordinates: { ...form.address.coordinates, latitude: parseFloat(e.target.value) } } })} />
      <input placeholder="Longitude" onChange={(e) => setForm({ ...form, address: { ...form.address, coordinates: { ...form.address.coordinates, longitude: parseFloat(e.target.value) } } })} />
      <select onChange={(e) => setForm({ ...form, delivery_boy_id: e.target.value })} value={form.delivery_boy_id}>
        <option value="">Select Delivery Guy</option>
        {deliveryGuys.map(guy => (
          <option key={guy.id} value={guy.id}>{guy.name}</option>
        ))}
      </select>
      <button onClick={addOrder}>Add Order</button>

      <hr />

      <h2>Orders</h2>
      {[...orders].reverse().map(order => (
        <div key={order.docId} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <p><b>{order.product_name}</b> - ₹{order.amount}</p>
          <p>Status: {order.status}</p>
          <p>Assigned To: {order.delivery_boy_id || 'None'}</p>

          <select
            value={order.delivery_boy_id || ''}
            onChange={(e) => assignDeliveryGuy(order.docId, e.target.value)}
          >
            <option value="">Assign Delivery Guy</option>
            {deliveryGuys.map(guy => (
              <option key={guy.id} value={guy.id}>{guy.name}</option>
            ))}
          </select>
          <button
            style={{ marginLeft: '10px', color: 'red' }}
            onClick={() => deleteOrder(order.docId, order.id, order.delivery_boy_id)}
          >
            Delete Order
          </button>
        </div>
      ))}

    </div>
  );
};

export default Orders;
