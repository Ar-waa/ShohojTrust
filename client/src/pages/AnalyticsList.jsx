import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/global.css";

const AnalyticsList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://shohojtrust.onrender.com/api/analytics/users");
        if (response.data.success) {
          setUsers(response.data.data);
        } else {
          setError("Failed to fetch users");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content" style={{ padding: "30px", width: "100%", background: "#f4f7f6" }}>
        <h1 style={{ marginBottom: "20px", color: "#2c3e50" }}>Platform Users</h1>
        <p style={{ marginBottom: "30px", color: "#7f8c8d" }}>Select a user to view their Behavioral Analytics Dashboard.</p>

        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div className="table-container" style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eaeaea" }}>
                  <th style={{ padding: "12px", textAlign: "left", color: "#2c3e50" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "#2c3e50" }}>Role</th>
                  <th style={{ padding: "12px", textAlign: "center", color: "#2c3e50" }}>Trust Score</th>
                  <th style={{ padding: "12px", textAlign: "center", color: "#2c3e50" }}>Joined</th>
                  <th style={{ padding: "12px", textAlign: "center", color: "#2c3e50" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #eaeaea", transition: "background 0.3s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f1f4f8"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px" }}>{u.email}</td>
                    <td style={{ padding: "12px", textTransform: "capitalize" }}>{u.role}</td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold", color: u.trustScore >= 10 ? "#27ae60" : "#e74c3c" }}>{u.trustScore}</td>
                    <td style={{ padding: "12px", textAlign: "center", color: "#7f8c8d" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => navigate(`/analytics/${u._id}`)}
                        style={{
                          background: "#3498db",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          transition: "background 0.3s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "#2980b9"}
                        onMouseOut={(e) => e.currentTarget.style.background = "#3498db"}
                      >
                        View Dashboard
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsList;
