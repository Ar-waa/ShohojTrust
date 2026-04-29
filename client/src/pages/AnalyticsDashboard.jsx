import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import AnalyticsCards from "../components/AnalyticsCards";
import BehaviorCharts from "../components/Charts/BehaviorCharts";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import { socket } from "../App";
import "../styles/global.css";

const AnalyticsDashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {

  const addNotification = (msg) => {
    setNotifications((prev) => [
      { id: Date.now(), msg },
      ...prev.slice(0, 4)
    ]);
  };

  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.email) {
    socket.emit("join", user.email);
  }

  socket.on("deadline_approaching", (data) => {
    addNotification(`⏳ Deadline approaching: ${data.title}`);
  });

  socket.on("deadline_missed", (data) => {
    addNotification(`⚠️ Deadline missed: ${data.title}`);
  });

  socket.on("penalty_applied", (data) => {
    addNotification(
      `💸 Penalty applied: ${data.title} (৳${data.penaltyAmount?.toFixed(2)})`
    );
  });

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`http://https://shohojtrust.onrender.com//api/analytics/${userId}`);
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

  return () => {
    socket.off("deadline_approaching");
    socket.off("deadline_missed");
    socket.off("penalty_applied");
  };

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
  <>
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 9999
    }}>
      {notifications.map((n) => (
        <div key={n.id} style={{
          background: "#1f2937",
          color: "white",
          padding: "10px 15px",
          marginBottom: "8px",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
        }}>
          {n.msg}
        </div>
      ))}
    </div>

    <div className="layout">
      <Sidebar />
      <div className="main-content" style={{ padding: "30px", width: "100%", background: "#f4f7f6" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button onClick={() => navigate("/analytics")} style={backBtnStyle}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ margin: 0 }}>
                {user.email}
              </h1>
            </div>
          </div>
        </div>

        <AnalyticsCards summary={summary} />
        <BehaviorCharts charts={charts} />

        <h3 style={{ marginTop: "30px" }}>Agreement Monitoring</h3>

      <table style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>Work Done</th>
            <th>Payment</th>
            <th>Penalty</th>
            <th>Trust Impact</th>
          </tr>
        </thead>
        <tbody>
          {data.monitoring?.map((m, i) => (
            <tr key={i}>
              <td>{m.title}</td>
              <td>{m.status}</td>
              <td>{new Date(m.deadline).toLocaleDateString()}</td>
              <td>{m.providerCompleted ? "Done" : "Pending"}</td>
              <td>{m.clientPaid ? "Paid" : "Unpaid"}</td>
              <td>৳{Number(m.totalAmount ?? 0).toFixed(2)}</td>
              <td>{m.trustImpact.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  </>
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
