import React from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#2ecc71", "#e74c3c", "#f39c12", "#3498db"];

const BehaviorCharts = ({ charts }) => {
  const { cancellationTrends, behaviorData, completionChartData } = charts;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
      
      {/* Cancellation Trends - Line Chart */}
      <div style={chartContainerStyle}>
        <h3 style={chartTitleStyle}>Cancellation Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cancellationTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#7f8c8d" />
            <YAxis stroke="#7f8c8d" />
            <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Legend />
            <Line type="monotone" dataKey="cancellations" stroke="#e74c3c" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Behavior Classification - Pie Chart */}
      <div style={chartContainerStyle}>
        <h3 style={chartTitleStyle}>Behavior Classification</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={behaviorData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {behaviorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Completed vs Cancelled - Bar Chart */}
      <div style={{ ...chartContainerStyle, gridColumn: "span 2" }}>
        <h3 style={chartTitleStyle}>Agreements Status Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={completionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#7f8c8d" />
            <YAxis stroke="#7f8c8d" />
            <Tooltip cursor={{ fill: "#f8f9fa" }} contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Legend />
            <Bar dataKey="value" radius={[5, 5, 0, 0]}>
              {completionChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

const chartContainerStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  transition: "box-shadow 0.3s"
};

const chartTitleStyle = {
  marginTop: 0,
  marginBottom: "20px",
  color: "#2c3e50",
  fontSize: "16px",
  fontWeight: "bold"
};

export default BehaviorCharts;
