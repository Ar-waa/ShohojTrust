import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import Sidebar from "../../components/Sidebar";
import API, { getMyReport } from "../../api";

const cardStyle = {
  background: "white",
  borderRadius: "12px",
  padding: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const statCard = {
  ...cardStyle,
  minHeight: "92px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};

const MyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await getMyReport();
        setReport(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const csvContent = useMemo(() => {
    if (!report) return "";

    const lines = [
      ["Metric", "Value"],
      ["Total Agreements", report.totalAgreements],
      ["On-time Completion Rate", `${report.onTimeRate}%`],
      ["Disputes", report.disputes],
      ["Penalties", report.penalties],
      ["Trust Score", report.trustScore],
      [],
      ["Month", "Activity"]
    ];

    (report.monthlyActivityWithLabels || []).forEach((m) => {
      lines.push([m.month, m.count]);
    });

    return lines
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
  }, [report]);

  const downloadCsv = () => {
    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-behavior-report.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    try {
      const response = await API.get("/reports/my-report/pdf", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-behavior-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to download PDF");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content" style={{ padding: "30px", width: "100%", background: "#f4f7f6" }}>
        <h1 style={{ marginBottom: "20px", color: "#2c3e50" }}>My Behavior Report</h1>

        {loading ? (
          <p>Loading report...</p>
        ) : error ? (
          <p style={{ color: "#dc2626" }}>{error}</p>
        ) : (
          <>
            <div style={{ ...cardStyle, marginBottom: "18px" }}>
              <h3 style={{ marginTop: 0, marginBottom: "8px" }}>User Profile</h3>
              <p style={{ margin: "4px 0" }}><strong>Email:</strong> {report?.user?.email}</p>
              <p style={{ margin: "4px 0", textTransform: "capitalize" }}><strong>Role:</strong> {report?.user?.role}</p>
              <p style={{ margin: "4px 0" }}><strong>Region:</strong> {report?.user?.region || "Unknown"}</p>
              <p style={{ margin: "4px 0" }}><strong>Trust Score:</strong> {report?.trustScore ?? 0}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px", marginBottom: "18px" }}>
              <div style={statCard}>
                <small style={{ color: "#64748b" }}>Agreements</small>
                <strong style={{ fontSize: "22px" }}>{report?.totalAgreements ?? 0}</strong>
              </div>
              <div style={statCard}>
                <small style={{ color: "#64748b" }}>On-time Rate</small>
                <strong style={{ fontSize: "22px" }}>{report?.onTimeRate ?? 0}%</strong>
              </div>
              <div style={statCard}>
                <small style={{ color: "#64748b" }}>Disputes</small>
                <strong style={{ fontSize: "22px" }}>{report?.disputes ?? 0}</strong>
              </div>
              <div style={statCard}>
                <small style={{ color: "#64748b" }}>Penalties</small>
                <strong style={{ fontSize: "22px" }}>{report?.penalties ?? 0}</strong>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>Monthly Activity (Last 6 Months)</h3>
              <div style={{ width: "100%", height: "320px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report?.monthlyActivityWithLabels || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ marginTop: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button className="btn secondary" onClick={downloadPdf}>Download PDF</button>
              <button className="btn secondary" onClick={downloadCsv}>Export CSV</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyReport;
