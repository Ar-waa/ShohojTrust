import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  History,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";

const ClientDashboard = () => {
  const [agreements, setAgreements] = useState([]);
  const navigate = useNavigate();

  // ==========================
  // FETCH AGREEMENTS
  // ==========================
  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await fetch(
        `http://localhost:5000/api/agreements/active?userEmail=${user.email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();

      setAgreements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // PREVIEW
  // ==========================
  const handlePreview = (item) => {
    localStorage.setItem("previewAgreement", JSON.stringify(item));
    navigate("/agreement-confirmation");
  };

  // ==========================
  // LOGOUT FUNCTION ⭐ NEW
  // ==========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // ==========================
  // SIDEBAR ITEMS
  // ==========================
  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Active Agreements", icon: <FileText size={18} /> },
    { name: "Agreement Activity Timeline", icon: <History size={18} /> },
    { name: "Trust Score", icon: <ShieldCheck size={18} /> },
    { name: "Analytics", icon: <BarChart3 size={18} /> },
    { name: "Settings", icon: <Settings size={18} /> }
  ];

  return (
    <div className="dashboard">

      {/* ==========================
          SIDEBAR
      ========================== */}
      <div className="sidebar">
        <h2 className="logo">ShohojTrust</h2>

        <div className="menu">
          {menu.map((item, index) => (
            <div key={index} className="menu-item">
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        {/* ==========================
            LOGOUT BUTTON ⭐ NEW
        ========================== */}
        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
          <div
            className="menu-item"
            onClick={handleLogout}
            style={{ color: "#ef4444", cursor: "pointer" }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* ==========================
          MAIN CONTENT
      ========================== */}
      <div className="main">

        <div className="content">

          <div className="page-header">
            <div>
              <h2>Client Dashboard</h2>
              <p className="subtext">
                View agreements sent by providers
              </p>
            </div>
          </div>

          {/* ==========================
              AGREEMENTS GRID
          ========================== */}
          <div className="agreement-grid">

            {agreements.length === 0 ? (
              <p>No agreements yet</p>
            ) : (
              agreements.map((item) => (
                <div className="agreement-card" key={item._id}>

                  <h3>{item.title}</h3>

                  <p className="agreement-desc">
                    {item.terms?.slice(0, 80)}...
                  </p>

                  <div className="template-actions">
                    <button
                      className="btn primary"
                      onClick={() => handlePreview(item)}
                    >
                      Preview
                    </button>
                  </div>

                </div>
              ))
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ClientDashboard;