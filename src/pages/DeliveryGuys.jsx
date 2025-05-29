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
import "./deliveryGuys.css";

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
    <div className="delivery-guys-container">
      {loading && <div className="loading-overlay">Loading...</div>}
      
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="icon">🚚</span>
          Delivery Management
        </h1>
        <p className="page-subtitle">Manage your delivery team efficiently</p>
      </div>

      {/* Add Delivery Guy Form */}
      <div className="form-section">
        <div className="form-header">
          <h2>
            <span className="icon">➕</span>
            Add New Delivery Guy
          </h2>
        </div>
        
        <div className="form-container">
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="form-select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="image">Profile Image URL</label>
              <input
                id="image"
                type="url"
                placeholder="Enter image URL (optional)"
                value={form.profile_image}
                onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <button
            onClick={addDeliveryGuy}
            disabled={loading}
            className="btn btn-primary"
          >
            <span className="icon">👤</span>
            Add Delivery Guy
          </button>
        </div>
      </div>

      {/* Delivery Guys List */}
      <div className="list-section">
        <div className="list-header">
          <h2>
            <span className="icon">👥</span>
            All Delivery Guys ({filteredDeliveryGuys.length})
          </h2>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="delivery-guys-grid">
          {filteredDeliveryGuys.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No delivery guys found</h3>
              <p>
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Add your first delivery guy to get started"
                }
              </p>
            </div>
          ) : (
            [...filteredDeliveryGuys].reverse().map((guy) => (
              <div key={guy.docId} className="delivery-guy-card">
                <div className="card-header">
                  <div className="profile-section">
                    {guy.profile_image ? (
                      <img
                        src={guy.profile_image}
                        alt={guy.name}
                        className="profile-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="profile-placeholder" style={{display: guy.profile_image ? 'none' : 'flex'}}>
                      {guy.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="profile-info">
                      <h3 className="name">{guy.name}</h3>
                      <span className="gender-badge">{guy.gender}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteDeliveryGuy(guy.docId, guy.name)}
                    className="btn btn-danger btn-sm"
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>

                <div className="card-body">
                  <div className="info-item">
                    <span className="icon">📞</span>
                    <span className="label">Phone:</span>
                    <span className="value">{guy.phone_number}</span>
                  </div>

                  <div className="info-item">
                    <span className="icon">🛵</span>
                    <span className="label">Orders Assigned:</span>
                    <span className="value orders-count">
                      {guy.orders_assigned?.length || 0}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="icon">🆔</span>
                    <span className="label">ID:</span>
                    <span className="value">#{guy.id}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="status-indicator">
                    <span className="status-dot active"></span>
                    <span className="status-text">Active</span>
                  </div>
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