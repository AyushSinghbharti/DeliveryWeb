import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setAdmin(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(timeInterval);
    };
  }, [navigate]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = () => {
    return currentTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="time-display">
          <span className="current-time">{formatTime()}</span>
        </div>
        <button className="logout-header-btn" onClick={handleLogout}>
          <span className="logout-icon">⚡</span>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <div className="greeting">
            <h1>{getGreeting()}, {admin?.name || 'Admin'}!</h1>
            <p className="subtitle">Ready to manage your operations</p>
          </div>
          
          {admin && (
            <div className="admin-profile">
              <div className="profile-avatar">
                <span>{admin.name?.charAt(0)?.toUpperCase() || 'A'}</span>
              </div>
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{admin.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{admin.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Role</span>
                  <span className="info-value role-badge">{admin.role}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{admin.phone || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Age</span>
                  <span className="info-value">{admin.age || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <div className="action-card" onClick={() => navigate("/orders")}>
              <div className="action-icon">📦</div>
              <div className="action-content">
                <h3>Manage Orders</h3>
                <p>View, update and track all orders</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div className="action-card" onClick={() => navigate("/delivery-guys")}>
              <div className="action-icon">🚚</div>
              <div className="action-content">
                <h3>Delivery Team</h3>
                <p>Manage delivery personnel</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div className="action-card" onClick={() => navigate("/analytics")}>
              <div className="action-icon">📊</div>
              <div className="action-content">
                <h3>Analytics</h3>
                <p>View performance metrics</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div className="action-card" onClick={() => navigate("/settings")}>
              <div className="action-icon">⚙️</div>
              <div className="action-content">
                <h3>Settings</h3>
                <p>Configure system preferences</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">42</div>
            <div className="stat-label">Active Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">12</div>
            <div className="stat-label">Delivery Guys</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">98%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}