import React, { useEffect, useState } from "react";
import "../styles/global.css";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

const AgreementConfirmation = () => {
  const [agreement, setAgreement] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("previewAgreement"));

    if (data) {
      setAgreement(data);
      setStatus(data.status || "pending");
    }
  }, []);

  // ==========================
  // BACK TO DASHBOARD
  // ==========================
  const goToDashboard = () => {
    navigate("/client-dashboard");
  };

  // ==========================
  // PDF DOWNLOAD
  // ==========================
const downloadPDF = async () => {
  try {
    const res = await fetch("https://shohojtrust.onrender.com/api/pdf/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: agreement?.title,
        terms: agreement?.terms,
        date: agreement?.date,
        amount: agreement?.amount,
        penalty: agreement?.penalty
      })
    });

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agreement.pdf";
    a.click();

  } catch (err) {
    console.log(err);
    alert("PDF download failed");
  }
};

  // ==========================
  // ACCEPT / REJECT HANDLER
  // ==========================
  const handleAction = async (actionStatus) => {
    try {
      if (!agreement?._id) {
        alert("Agreement not found. Please preview again.");
        return;
      }

      setLoading(true);

      const res = await fetch(
        `https://shohojtrust.onrender.com/api/agreements/${agreement._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status: actionStatus,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.msg || "Update failed");
      }

      setStatus(actionStatus);

      setAgreement((prev) => ({
        ...prev,
        status: actionStatus,
      }));

      alert(`Agreement ${actionStatus}`);
    } catch (err) {
      console.log(err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="main">
        <div className="content">
          {/* HEADER */}
          <div className="page-header">
            <div>
              <h2>Confirm Agreement</h2>
              <p className="subtext">
                Current Status: <b>{status}</b>
              </p>
            </div>

            <button className="btn secondary" onClick={goToDashboard}>
              ⬅ Back to Dashboard
            </button>
          </div>

          <div className="dashboard-grid">
            <div className="form-container">
              <div className="card">
                <h3>Agreement Summary</h3>

                <div className="agreement-box">
                  <p><b>Title:</b> {agreement?.title}</p>
                  <p><b>Terms:</b> {agreement?.terms}</p>
                  <p><b>Deadline:</b> {agreement?.date}</p>
                  <p><b>Payment:</b> {agreement?.amount} BDT</p>
                  <p><b>Penalty:</b> {agreement?.penalty}%</p>
                </div>

                <div className="template-actions">
                  <button className="btn secondary" onClick={downloadPDF}>
                    📄 Download PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="summary-card">
              <h3>Status Timeline</h3>

              <div className="timeline">
                <div className="step done">🟢 Created</div>
                <div className="step done">🟢 Sent</div>

                <div className={`step ${status === "pending" ? "pending" : "done"}`}>
                  🟡 Pending Confirmation
                </div>

                <div className={`step ${status === "accepted" ? "done" : ""}`}>
                  ⚪ Accepted
                </div>

                <div className={`step ${status === "rejected" ? "done" : ""}`}>
                  ⚪ Rejected
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div
            className="template-actions"
            style={{
              marginTop: "30px",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <button
              onClick={() => handleAction("accepted")}
              className="btn primary"
              disabled={status !== "pending" || loading}
              style={{
                opacity: status !== "pending" ? 0.5 : 1,
                cursor: status !== "pending" ? "not-allowed" : "pointer",
              }}
            >
              ✅ Accept
            </button>

            <button
              onClick={() => handleAction("rejected")}
              className="btn danger"
              disabled={status !== "pending" || loading}
              style={{
                opacity: status !== "pending" ? 0.5 : 1,
                cursor: status !== "pending" ? "not-allowed" : "pointer",
              }}
            >
              ❌ Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementConfirmation;