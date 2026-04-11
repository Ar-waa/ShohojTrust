import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Auth = () => {
    const [isSignup, setIsSignup] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
    email: "",
    password: "",
});

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        if (isSignup) {
        // REGISTER
        await API.post("/auth/register", form);
        alert("Account created! Now login.");
        setIsSignup(false);
        } else {
        // LOGIN
        const res = await API.post("/auth/login", {
            email: form.email,
            password: form.password
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/dashboard");
        }
    } catch (err) {
        alert(err.response?.data?.msg || "Auth failed");
    }
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
            <input type="email" placeholder="Email" required onChange={(e) =>
            setForm({ ...form, email: e.target.value })}/>
            <input type="password" placeholder="Password" required onChange={(e) =>
            setForm({ ...form, password: e.target.value })} />

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
