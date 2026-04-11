import React, { useEffect, useState } from "react";
import "../styles/global.css";
import jsPDF from "jspdf";

const AgreementConfirmation = () => {

  const [agreement, setAgreement] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("previewAgreement"));
    setAgreement(data);
  }, []);

  // ✅ PDF DOWNLOAD
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Agreement Confirmation", 20, 20);

    doc.setFontSize(12);

    doc.text(`Title: ${agreement?.title || ""}`, 20, 40);
    doc.text(`Terms: ${agreement?.terms || ""}`, 20, 50);
    doc.text(`Deadline: ${agreement?.date || ""}`, 20, 60);
    doc.text(`Payment: ${agreement?.amount || ""} BDT`, 20, 70);
    doc.text(`Penalty: ${agreement?.penalty || ""}%`, 20, 80);

    doc.save("agreement.pdf");
  };

  // ✅ UPDATED BACKEND FUNCTION (THIS IS YOUR REQUIRED FIX)
  const handleAction = async (status) => {
    try {
      await fetch(`http://localhost:5000/api/agreements/${agreement._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status,
          clientEmail: agreement.clientEmail,
          providerEmail: agreement.providerEmail
        })
      });

      alert("Updated: " + status);

    } catch (err) {
      console.log(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="dashboard">

      <div className="main">

        <div className="content">

          <div className="page-header">
            <div>
              <h2>Confirm Agreement</h2>
              <p className="subtext">Review and confirm your agreement details</p>
            </div>
          </div>

          <div className="dashboard-grid">

            <div className="form-container">

              <div className="card">
                <h3>Agreement Summary</h3>

                <div className="agreement-box">
                  <p><b>Title:</b> {agreement?.title || "Not provided"}</p>
                  <p><b>Terms:</b> {agreement?.terms || "Not provided"}</p>
                  <p><b>Deadline:</b> {agreement?.date || "Not provided"}</p>
                  <p><b>Payment:</b> {agreement?.amount || "0"} BDT</p>
                  <p><b>Penalty:</b> {agreement?.penalty || "0"}%</p>
                </div>

                <div className="template-actions">

                  <button className="btn secondary" onClick={downloadPDF}>
                    📄 Download PDF
                  </button>

                  <button className="btn secondary">
                    📧 Send Email
                  </button>

                </div>

              </div>

            </div>

            <div className="summary-card">

              <h3>Status Timeline</h3>

              <div className="timeline">
                <div className="step done">🟢 Created</div>
                <div className="step done">🟢 Sent</div>
                <div className="step pending">🟡 Pending Confirmation</div>
                <div className="step">⚪ Activated</div>
              </div>

            </div>

          </div>

          {/* ✅ UPDATED BUTTONS */}
          <div className="template-actions" style={{ marginTop: "30px", justifyContent: "center" }}>

            <button
              onClick={() => handleAction("accepted")}
              className="btn primary"
            >
              ✅ Accept
            </button>

            <button className="btn secondary">
              ✏️ Request Modification
            </button>

            <button
              onClick={() => handleAction("rejected")}
              className="btn danger"
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