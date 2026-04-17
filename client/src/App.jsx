import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProviderDashboard from "./pages/ProviderDashboard";
import Templates from "./pages/Templates";
import ActiveAgreements from "./pages/ActiveAgreements";
import AgreementConfirmation from "./pages/AgreementConfirmation";
import AgreementActivityTimeline from "./pages/AgreementActivityTimeline";

import "./styles/global.css";

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
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
        <Route path="/provider" element={<PrivateRoute allowedRoles={['provider', 'admin']}> <ProviderDashboard /> </PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute allowedRoles={['provider', 'admin']}><Templates /></PrivateRoute>} />
        <Route path="/agreements" element={<PrivateRoute><ActiveAgreements /></PrivateRoute>}/>
        <Route path="/agreement-activity-timeline" element={<PrivateRoute><AgreementActivityTimeline /></PrivateRoute>} />
        <Route path="/agreement-activity-timeline/:agreementId" element={<PrivateRoute><AgreementActivityTimeline /></PrivateRoute>} />
        <Route path="/agreement-confirmation" element={<PrivateRoute><AgreementConfirmation /></PrivateRoute>} /> 
      </Routes>
    </Router>
  );
}

export default App;

// // Usage in your Routes:
// <Routes>
//   <Route path="/admin" element={
//     <ProtectedRoute allowedRoles={['admin']}> <AdminDashboard /> </ProtectedRoute>
//   } />
//   <Route path="/provider" element={
//     <ProtectedRoute allowedRoles={['provider']}> <ProviderDashboard /> </ProtectedRoute>
//   } />
//   <Route path="/client" element={
//     <ProtectedRoute allowedRoles={['client']}> <ClientDashboard /> </ProtectedRoute>
//   } />
// </Routes>

