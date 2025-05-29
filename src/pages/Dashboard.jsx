import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="menu">
        <button onClick={() => navigate("/orders")}>Manage Orders</button>
        <button onClick={() => navigate("/delivery-guys")}>Manage Delivery Guys</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
