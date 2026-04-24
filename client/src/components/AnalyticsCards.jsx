import React from "react";

const AnalyticsCards = ({ summary }) => {
  const { completionRate, cancellationRate, avgResponseTimeText, positiveBehaviorPercentage, totalAgreements } = summary;

  const cards = [
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      subtitle: `Total Agreements: ${totalAgreements}`,
      color: completionRate >= 80 ? "#2ecc71" : completionRate >= 50 ? "#f1c40f" : "#e74c3c"
    },
    {
      title: "Avg Response Time",
      value: avgResponseTimeText,
      subtitle: "From creation to action",
      color: "#3498db"
    },
    {
      title: "Cancellation Rate",
      value: `${cancellationRate}%`,
      subtitle: "Percentage cancelled",
      color: cancellationRate < 20 ? "#2ecc71" : "#e74c3c"
    },
    {
      title: "Positive Behavior",
      value: `${positiveBehaviorPercentage}%`,
      subtitle: "Completed / Accepted vs Total",
      color: positiveBehaviorPercentage >= 70 ? "#2ecc71" : "#f39c12"
    }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
      {cards.map((card, index) => (
        <div 
          key={index} 
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            borderLeft: `5px solid ${card.color}`,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "default"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
          }}
        >
          <h3 style={{ margin: 0, fontSize: "14px", color: "#7f8c8d", textTransform: "uppercase", letterSpacing: "1px" }}>{card.title}</h3>
          <p style={{ margin: "10px 0", fontSize: "28px", fontWeight: "bold", color: "#2c3e50" }}>{card.value}</p>
          <small style={{ color: "#bdc3c7" }}>{card.subtitle}</small>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsCards;
