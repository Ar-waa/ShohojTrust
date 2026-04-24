import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const API = "http://localhost:5000/api/trust";

const TrustScore = () => {
  const [users, setUsers] = useState([]);
  const [myData, setMyData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTrustData();
  }, []);

  const fetchTrustData = async () => {
    try {
      console.log("TOKEN:", token); // debug if needed

      // ==========================
      // MY TRUST SCORE
      // ==========================
      const res1 = await fetch(`${API}/trust-score`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res1.ok) throw new Error("Failed to fetch my trust score");

      const my = await res1.json();
      setMyData(my);

      // ==========================
      // ALL USERS
      // ==========================
      const res2 = await fetch(`${API}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res2.ok) throw new Error("Failed to fetch users");

      const allUsers = await res2.json();

      // ==========================
      // ROLE FILTERING
      // ==========================
      let filtered = [];

      if (user.role === "client") {
        filtered = allUsers.filter((u) => u.role === "provider");
      } else if (user.role === "provider") {
        filtered = allUsers.filter((u) => u.role === "client");
      } else {
        // Admin sees both clients and providers, but not other admins
        filtered = allUsers.filter((u) => u.role === "client" || u.role === "provider");
      }

      setUsers(filtered);
    } catch (err) {
      console.log("Trust fetch error:", err.message);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Topbar />

        <div className="content">
          <h2>Trust Score</h2>

          {/* MY SCORE */}
          <div className="card">
            <h3>My Trust Score</h3>
           <h1 style={{ color: "#1f8f3a", fontWeight: "bold" }}>{myData?.trustScore || 0}</h1>            <p>{myData?.email}</p>
          </div>

          {/* USERS TABLE */}
          <div className="card" style={{ marginTop: "20px" }}>
            <h3>
              {user.role === "admin"
                ? "Providers & Clients"
                : user.role === "client"
                ? "Providers"
                : "Clients"}
            </h3>

            <table className="aa-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Trust Score</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="3">No users found</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.trustScore ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrustScore;