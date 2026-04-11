import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
    const [isSignup, setIsSignup] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // fake login
        localStorage.setItem("user", "loggedIn");
        // TEMP: no backend yet
        navigate("/dashboard");
    };

    return (
        <div className="auth-page">
        <div className="auth-card">

            <h2 className="logo center">ShohojTrust</h2>

            <div className="auth-toggle">
            <button
                className={!isSignup ? "active" : ""}
                onClick={() => setIsSignup(false)}
            >
                Login
            </button>

            <button
                className={isSignup ? "active" : ""}
                onClick={() => setIsSignup(true)}
            >
                Sign Up
            </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />

            {isSignup && (
                <input type="password" placeholder="Confirm Password" required />
            )}

            {!isSignup && <p className="forgot">Forgot Password?</p>}

            <button className="btn primary full">
                {isSignup ? "Create Account" : "Login"}
            </button>
            </form>

            <p className="switch-text">
            {isSignup ? "Already have an account?" : "Don’t have an account?"}
            <span onClick={() => setIsSignup(!isSignup)}>
                {isSignup ? " Login" : " Sign Up"}
            </span>
            </p>

        </div>
        </div>
    );
};

export default Auth;
