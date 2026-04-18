import React, { useEffect, useState } from "react";
import API from "../api"; // your axios instance
import { useParams } from "react-router-dom";

const Analytics = () => {
  const {  agreementId } = useParams();
  const [stats, setStats] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log("URL params:", useParams());

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get(
          `/events/analytics/${agreementId}`
        );

        setStats(res.data.stats);
        setAgreement(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [agreementId]);

  if (loading) return <p>Loading analytics...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Agreement Analytics</h2>

      <h3>{agreement?.title}</h3>
      <p>Category: {agreement?.category}</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <StatCard label="Positive" value={stats.positive} color="green" />
        <StatCard label="Neutral" value={stats.neutral} color="gray" />
        <StatCard label="Negative" value={stats.negative} color="red" />
        <StatCard label="Dispute" value={stats.dispute} color="orange" />
      </div>
    </div>
  );
};

// Simple reusable card
const StatCard = ({ label, value, color }) => {
  return (
    <div
      style={{
        padding: "15px",
        border: `2px solid ${color}`,
        borderRadius: "10px",
        minWidth: "120px",
        textAlign: "center",
      }}
    >
      <h4 style={{ margin: 0 }}>{label}</h4>
      <h2 style={{ color }}>{value}</h2>
    </div>
  );
};

export default Analytics;
