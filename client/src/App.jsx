import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useEffect } from "react";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ProviderDashboard from "./pages/ProviderDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Payment from "./pages/Payment";
import Templates from "./pages/Templates";
import ActiveAgreements from "./pages/ActiveAgreements";
import AgreementHistory from "./pages/AgreementHistory";
import AgreementConfirmation from "./pages/AgreementConfirmation";
import AgreementActivityTimeline from "./pages/AgreementActivityTimeline";
import AnalyticsList from "./pages/AnalyticsList";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Dispute from "./pages/Dispute";
import AdminDisputes from "./pages/AdminDisputes";
import AdminDisputeDetails from "./pages/AdminDisputeDetails";
import AdminDashboard from "./pages/AdminDashboard";
import MyReport from "./pages/Reports/MyReport";

import TrustScore from "./pages/TrustScore";

import "./styles/global.css";

// ==========================
// PROTECTED ROUTE
// ==========================
const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
      useEffect(() => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.email) {
        socket.emit("join", user.email);
        console.log("Joined socket room:", user.email);
      }

      socket.on("deadline_approaching", (data) => {
        console.log("⏳ Deadline approaching:", data);
        alert(`⏳ Deadline approaching: ${data.title}`);
      });

      socket.on("deadline_missed", (data) => {
        console.log("⚠️ Deadline missed:", data);
        alert(`⚠️ Deadline missed: ${data.title}`);
      });

      socket.on("penalty_applied", (data) => {
        console.log("💸 Penalty applied:", data);
        alert(`💸 Penalty applied: ৳${data.penaltyAmount}`);
      });

      return () => {
        socket.off("deadline_approaching");
        socket.off("deadline_missed");
        socket.off("penalty_applied");
      };
    }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/trust" element={<TrustScore />} />
        {/* DASHBOARDS (PROTECTED) */}
        <Route
          path="/provider-dashboard"
          element={
            <PrivateRoute allowedRoles={["provider"]}>
              <ProviderDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/client-dashboard"
          element={
            <PrivateRoute allowedRoles={["client"]}>
              <ClientDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <PrivateRoute allowedRoles={["client"]}>
              <Payment />
            </PrivateRoute>
          }
        />

        {/* OTHER ROUTES */}
        <Route
          path="/templates"
          element={
            <PrivateRoute allowedRoles={["provider", "admin"]}>
              <Templates />
            </PrivateRoute>
          }
        />

        <Route
          path="/agreements"
          element={
            <PrivateRoute allowedRoles={["client", "provider", "admin"]}>
              <ActiveAgreements />
            </PrivateRoute>
          }
        />

        <Route
          path="/agreement-history"
          element={
            <PrivateRoute allowedRoles={["client", "provider", "admin"]}>
              <AgreementHistory />
            </PrivateRoute>
          }
        />

        <Route
          path="/agreement-activity-timeline"
          element={
            <PrivateRoute allowedRoles={["client", "provider", "admin"]}>
              <AgreementActivityTimeline />
            </PrivateRoute>
          }
        />

        <Route
          path="/agreement-activity-timeline/:agreementId"
          element={
            <PrivateRoute allowedRoles={["client", "provider", "admin"]}>
              <AgreementActivityTimeline />
            </PrivateRoute>
          }
        />

        <Route
          path="/agreement-confirmation"
          element={
            <PrivateRoute allowedRoles={["client", "provider"]}>
              <AgreementConfirmation />
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute allowedRoles={["client", "provider", "admin"]}>
              <AnalyticsList />
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics/:userId"
          element={
            <PrivateRoute allowedRoles={["client", "provider", "admin"]}>
              <AnalyticsDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports/my-report"
          element={
            <PrivateRoute allowedRoles={["client", "provider"]}>
              <MyReport />
            </PrivateRoute>
          }
        />

        <Route
          path="/dispute"
          element={
            <PrivateRoute allowedRoles={["client", "provider"]}>
              <Dispute />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/disputes"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDisputes />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/disputes/:id"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDisputeDetails />
            </PrivateRoute>
          }
        />


        {/* OPTIONAL */}
        <Route path="/unauthorized" element={<h2>Unauthorized Access</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
export const socket = io("http://localhost:5000");
