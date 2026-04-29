import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await API.post("/auth", {
        email,
        password,
        isSignup: false
      });

      if (data?.user?.role !== "admin") {
        setError("Only admin can log in here");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(data.msg || "Admin login successful");
      navigate("/admin-dashboard");
      return;
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid admin credentials");
      return;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="logo-text">ShohojTrust Admin</h2>
          <p className="auth-subtitle">Admin access only</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={{ color: "#dc2626", marginTop: "0.5rem" }}>{error}</p>}

          <button type="submit" className="btn-modern">
            Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
