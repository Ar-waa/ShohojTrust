import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import ActiveAgreements from "./pages/ActiveAgreements";
import AgreementConfirmation from "./pages/AgreementConfirmation";
import AgreementActivityTimeline from "./pages/AgreementActivityTimeline";

import "./styles/global.css";

const PrivateRoute = ({ children }) => {
  const isAuth = localStorage.getItem("user");

  return isAuth ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<PrivateRoute> <Dashboard /> </PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
        <Route path="/agreements" element={<PrivateRoute><ActiveAgreements /></PrivateRoute>}/>
        <Route path="/agreement-activity-timeline" element={<PrivateRoute><AgreementActivityTimeline /></PrivateRoute>} />
        <Route path="/agreement-activity-timeline/:agreementId" element={<PrivateRoute><AgreementActivityTimeline /></PrivateRoute>} />
        <Route path="/agreement-confirmation" element={<PrivateRoute><AgreementConfirmation /></PrivateRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
