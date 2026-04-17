import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth", {
        email,
        password,
        role: isSignup ? role : undefined,
        isSignup
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(data.msg);

      const userRole = data.user.role;

      // ✅ FIXED ROUTES HERE
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "provider") {
        navigate("/provider-dashboard");
      } else {
        navigate("/client-dashboard");
      }

    } catch (err) {
      console.log("AUTH ERROR:", err.response?.data);
      alert(err.response?.data?.msg || "Authentication failed.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="logo-text">ShohojTrust</h2>
          <p className="auth-subtitle">
            {isSignup ? "Create your professional account" : "Welcome back! Please login"}
          </p>
        </div>

        <div className="auth-toggle-pill">
          <button
            type="button"
            className={!isSignup ? "active" : ""}
            onClick={() => setIsSignup(false)}
          >
            Login
          </button>
          <button
            type="button"
            className={isSignup ? "active" : ""}
            onClick={() => setIsSignup(true)}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="role-selection">
              <p className="role-label">Register as:</p>
              <div className="radio-group">
                <label className={`radio-item ${role === 'client' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="client" 
                    checked={role === 'client'} 
                    onChange={(e) => setRole(e.target.value)} 
                  />
                  <span>Client</span>
                </label>

                <label className={`radio-item ${role === 'provider' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="provider" 
                    checked={role === 'provider'} 
                    onChange={(e) => setRole(e.target.value)} 
                  />
                  <span>Provider</span>
                </label>
              </div>
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isSignup && (
            <div className="input-group">
              <input type="password" placeholder="Confirm Password" required />
            </div>
          )}

          {!isSignup && <p className="forgot-link">Forgot Password?</p>}

          <button type="submit" className="btn-modern">
            {isSignup ? "Get Started" : "Sign In"}
          </button>
        </form>

        <p className="switch-prompt">
          {isSignup ? "Already have an account?" : "New to ShohojTrust?"}
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? " Log in" : " Create account"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;