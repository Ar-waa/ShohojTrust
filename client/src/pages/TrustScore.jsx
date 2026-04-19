import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const TrustScore = () => {
  const [users, setUsers] = useState([]);
  const [myData, setMyData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchTrustData();
  }, []);

  const fetchTrustData = async () => {
    try {
      const token = localStorage.getItem("token");

      // ==========================
      // GET MY SCORE
      // ==========================
      const res1 = await fetch("http://localhost:5000/api/trust", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const my = await res1.json();
      setMyData(my);

      // ==========================
      // GET ALL USERS
      // ==========================
      const res2 = await fetch("http://localhost:5000/api/trust/all", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const allUsers = await res2.json();

      // ==========================
      // ROLE FILTERING
      // ==========================
      let filtered = [];

      if (user.role === "client") {
        filtered = allUsers.filter(u => u.role === "provider");
      } 
      else if (user.role === "provider") {
        filtered = allUsers.filter(u => u.role === "client");
      } 
      else {
        filtered = allUsers; // admin
      }

      setUsers(filtered);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dashboard">

      <Sidebar />

      <div className="main">
        <Topbar />

        <div className="content">

          <h2>Trust Score</h2>

          {/* ==========================
              MY SCORE
          ========================== */}
          <div className="card">
            <h3>My Trust Score</h3>
            <h1>{myData?.trustScore || 0} / 100</h1>
            <p>{myData?.email}</p>
          </div>

          {/* ==========================
              OTHER USERS
          ========================== */}
          <div className="card" style={{ marginTop: "20px" }}>
            <h3>
              {user.role === "admin"
                ? "All Users"
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
                      <td>{u.trustScore || 0}</td>
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