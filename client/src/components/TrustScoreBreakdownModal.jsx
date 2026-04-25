import React from "react";
import "./TrustScoreBreakdownModal.css";

const TrustScoreBreakdownModal = ({ isOpen, onClose, breakdown }) => {
  if (!isOpen || !breakdown) return null;

  const { trustScore, email, role, reliabilityTier, breakdown: scoreBreakdown, stats } = breakdown;

  const contextLabels = {
    agreement_completion: "Agreement Completion",
    payment_reliability: "Payment Reliability",
    dispute_history: "Dispute History",
    response_time: "Response Time",
    administrative: "Administrative"
  };

  const getContextColor = (score) => {
    if (score >= 25) return "#1f8f3a";
    if (score >= 15) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content trust-breakdown-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2>Trust Score Breakdown</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Main Score */}
        <div className="breakdown-main-score">
          <div className="score-circle">
            <span className="score-value" style={{ color: reliabilityTier.color }}>
              {Math.round(trustScore)}
            </span>
            <span className="score-label">Out of 100</span>
          </div>
          <div className="score-details">
            <p><strong>{email}</strong></p>
            <p style={{ color: reliabilityTier.color, fontWeight: "bold", fontSize: "16px" }}>
              {reliabilityTier.tier} Reliability Tier
            </p>
            <p style={{ color: "#666", fontSize: "14px" }}>
              {reliabilityTier.description}
            </p>
          </div>
        </div>

        {/* Context-based Scores */}
        <div className="breakdown-section">
          <h3>Score Breakdown by Context</h3>
          <div className="score-items">
            {Object.entries(scoreBreakdown).map(([key, item]) => (
              <div key={key} className="score-item">
                <div className="score-item-header">
                  <span className="context-label">
                    {contextLabels[item.context] || item.context}
                  </span>
                  <span 
                    className="score-badge"
                    style={{ backgroundColor: getContextColor(item.score) }}
                  >
                    {Math.round(item.score)}/30
                  </span>
                </div>
                <div className="score-bar">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${(item.score / 30) * 100}%`,
                      backgroundColor: getContextColor(item.score)
                    }}
                  ></div>
                </div>
                <div className="score-item-meta">
                  {item.count !== undefined && (
                    <span>{key === "disputeRecord" ? `${item.count} disputes` : `${item.count} total`}</span>
                  )}
                  {item.avgHours && <span>{item.avgHours}h avg response</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="breakdown-section">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalAgreements}</div>
              <div className="stat-label">Total Agreements</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: "#1f8f3a" }}>
                {stats.completedAgreements}
              </div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: "#f59e0b" }}>
                {stats.paidAgreements}
              </div>
              <div className="stat-label">Paid</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: "#ef4444" }}>
                {stats.disputes}
              </div>
              <div className="stat-label">Disputes</div>
            </div>
          </div>
        </div>

        {/* Tier Explanation */}
        <div className="breakdown-section tier-explanation">
          <h3>Reliability Tier System</h3>
          <div className="tier-info">
            <div className="tier-item high">
              <strong>High Tier (75+)</strong>
              <p>Excellent reliability. Few disputes, timely payments, high completion rates.</p>
            </div>
            <div className="tier-item moderate">
              <strong>Moderate Tier (50-74)</strong>
              <p>Good reliability. Some minor issues but generally dependable.</p>
            </div>
            <div className="tier-item low">
              <strong>Low Tier (Below 50)</strong>
              <p>Needs improvement. Multiple disputes or payment issues.</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button 
            onClick={onClose}
            style={{
              padding: "10px 30px",
              backgroundColor: "#1f8f3a",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default TrustScoreBreakdownModal;
