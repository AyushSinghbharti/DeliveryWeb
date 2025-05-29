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
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch delivery guys from Firestore
  const fetchDeliveryGuys = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "deliveryGuys"), orderBy("id", "asc")));
      const data = snap.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setDeliveryGuys(data);
    } catch (error) {
      console.error("Error fetching delivery guys:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryGuys();
  }, []);

  const addDeliveryGuy = async () => {
    if (!form.name.trim() || !form.phone_number.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const newId = deliveryGuys.length > 0 ? deliveryGuys[deliveryGuys.length - 1].id + 1 : 501;
      const docId = `deliveryGuy-${newId}`;
      const newGuy = {
        id: newId,
        ...form,
        orders_assigned: [],
        created_at: new Date().toISOString(),
      };

      await setDoc(doc(db, "deliveryGuys", docId), newGuy);
      setForm({
        name: "",
        phone_number: "",
        gender: "Male",
        profile_image: "",
      });
      await fetchDeliveryGuys();
    } catch (error) {
      console.error("Error adding delivery guy:", error);
      alert("Error adding delivery guy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a delivery guy
  const deleteDeliveryGuy = async (docId, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "deliveryGuys", docId));
        await fetchDeliveryGuys();
      } catch (error) {
        console.error("Error deleting delivery guy:", error);
        alert("Error deleting delivery guy. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter delivery guys based on search term
  const filteredDeliveryGuys = deliveryGuys.filter(guy =>
    guy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guy.phone_number.includes(searchTerm)
  );


  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center text-white text-lg">
          Loading...
        </div>
      )}

      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800">🚚 Delivery Management</h1>
        <p className="text-gray-500 mt-1">Efficiently manage your delivery workforce</p>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">➕ Add Delivery Guy</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Full Name *</label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Phone Number *</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Profile Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/profile.jpg"
              value={form.profile_image}
              onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={addDeliveryGuy}
          disabled={loading}
          className="mt-6 bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-lg font-medium"
        >
          👤 Add Delivery Guy
        </button>
      </div>

      {/* Delivery List Section */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            👥 All Delivery Guys ({filteredDeliveryGuys.length})
          </h2>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeliveryGuys.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <h3 className="text-lg font-semibold">No delivery guys found</h3>
              <p>{searchTerm ? "Try changing the search term." : "Start by adding your first delivery guy."}</p>
            </div>
          ) : (
            [...filteredDeliveryGuys].reverse().map((guy) => (
              <div key={guy.docId} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {guy.profile_image ? (
                      <img
                        src={guy.profile_image}
                        alt={guy.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ display: guy.profile_image ? 'none' : 'flex' }}
                    >
                      {guy.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-gray-800 font-medium">{guy.name}</h3>
                      <p className="text-sm text-gray-500">{guy.gender}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDeliveryGuy(guy.docId, guy.name)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    🗑️
                  </button>
                </div>

                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span>{guy.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🛵</span>
                    <span>Orders: {guy.orders_assigned?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🆔</span>
                    <span>ID: #{guy.id}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Active
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryGuys;