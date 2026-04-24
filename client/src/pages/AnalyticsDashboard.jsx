import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import AnalyticsCards from "../components/AnalyticsCards";
import BehaviorCharts from "../components/Charts/BehaviorCharts";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import "../styles/global.css";

const AnalyticsDashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/analytics/${userId}`);
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError("Failed to fetch analytics");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main-content" style={{ padding: "30px" }}>
          <h2 style={{ color: "red" }}>{error || "No data available"}</h2>
          <button onClick={() => navigate("/analytics")} style={backBtnStyle}>Back to Users</button>
        </div>
      </div>
    );
  }

  const { user, summary, charts } = data;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content" style={{ padding: "30px", width: "100%", background: "#f4f7f6" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button onClick={() => navigate("/analytics")} style={backBtnStyle} title="Back">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ margin: 0, color: "#2c3e50", display: "flex", alignItems: "center", gap: "10px" }}>
                <UserIcon size={28} /> {user.email}
              </h1>
              <p style={{ margin: "5px 0 0 0", color: "#7f8c8d", textTransform: "capitalize" }}>
                Role: <strong>{user.role}</strong> | Trust Score: <strong style={{ color: user.trustScore >= 10 ? "#27ae60" : "#e74c3c" }}>{user.trustScore}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <AnalyticsCards summary={summary} />

        {/* Analytics Charts */}
        <BehaviorCharts charts={charts} />

      </div>
    </div>
  );
};

const backBtnStyle = {
  background: "white",
  border: "1px solid #dcdde1",
  padding: "10px",
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2c3e50",
  transition: "all 0.3s",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
};

export default AnalyticsDashboard;
