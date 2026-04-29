import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./ActiveAgreements.css";

const ClientDashboard = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userEmail = user?.email ? encodeURIComponent(user.email) : "";

      const apiBase = import.meta.env.VITE_API_URL;
      const endpoint = userEmail
        ? `${apiBase}/api/agreements/active?userEmail=${userEmail}`
        : `${apiBase}/api/agreements/active`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch active agreements");
      }

      const data = await res.json();
      setAgreements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setError(err.message || "Something went wrong");
      setAgreements([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (item) => {
    localStorage.setItem("previewAgreement", JSON.stringify(item));
    navigate("/agreement-confirmation");
  };

  const acceptedCount = agreements.filter((i) => i.status === "accepted").length;
  const rejectedCount = agreements.filter((i) => i.status === "rejected").length;
  const pendingCount = agreements.filter((i) => !i.status || i.status === "pending").length;

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">

          <div className="page-header">
            <div>
              <h2>Client Dashboard</h2>
              <p className="subtext">
                View agreements sent by providers
              </p>
            </div>
          </div>

          <div className="aa-wrapper">
            <div className="aa-card">

              <div className="aa-card-header">
                <h1>Active Agreements</h1>
                <p>Review and preview your active agreements</p>
              </div>

              {loading ? (
                <div className="aa-empty">Loading agreements...</div>
              ) : (
                <>
                  <table className="aa-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Provider Email</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {error ? (
                        <tr>
                          <td colSpan="4" className="aa-empty aa-error">
                            {error}
                          </td>
                        </tr>
                      ) : agreements.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="aa-empty">
                            No agreements yet.
                          </td>
                        </tr>
                      ) : (
                        agreements.map((item) => (
                          <tr key={item._id}>
                            <td>{item.title || "Untitled Agreement"}</td>

                            <td>
                              <span className="aa-email">{item.providerEmail || "N/A"}</span>
                            </td>

                            <td>
                              <span
                                className={`aa-badge ${
                                  item.status === "accepted"
                                    ? "accepted"
                                  :item.status === "work_done"
                                    ? "accepted"
                                    : item.status === "completed" ? "✔"
                                    : item.status === "rejected"
                                      ? "rejected"
                                      : "pending"
                                }`}
                              >
                                <span className="aa-badge-icon">
                                  {item.status === "accepted"
                                    ? "✔"
                                    : item.status === "work_done"
      ?                               "✔"
                                      : item.status === "completed" ? "✔"
                                    : item.status === "rejected"
                                      ? "✕"
                                      : "⏳"}
                                </span>
                                {item.status === "accepted"
                                  ? "Accepted"
                                  : item.status === "work_done"
                                    ? "Work Completed"
                                    : item.status === "completed" ? "✔"
                                  : item.status === "rejected"
                                    ? "Rejected"
                                    : "Pending"}
                              </span>
                            </td>

                            <td>
                              <button
                                className="btn primary"
                                onClick={() => handlePreview(item)}
                              >
                                Preview
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div className="aa-card-footer">
                    <span>Showing {agreements.length} agreements</span>
                    <span className="aa-count-pill">
                      🟡 {pendingCount} Pending · 🟢 {acceptedCount} Accepted · 🔴 {rejectedCount} Rejected
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ClientDashboard;
