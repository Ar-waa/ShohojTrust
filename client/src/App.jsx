import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ProviderDashboard from "./pages/ProviderDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Payment from "./pages/Payment";
import Templates from "./pages/Templates";
import ActiveAgreements from "./pages/ActiveAgreements";
import AgreementConfirmation from "./pages/AgreementConfirmation";
import AgreementActivityTimeline from "./pages/AgreementActivityTimeline";
import Analytics from "./pages/Analytics";

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
          path= "/agreements/:agreementId/analytics"
          element={
            <PrivateRoute allowedRoles={["client", "provider", "admin"]}>
              <Analytics />
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