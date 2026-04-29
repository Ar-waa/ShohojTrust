import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <h2 className="logo">ShohojTrust</h2>
                
                <div className="nav-links">
                    <span>Features</span>
                    <span>Pricing</span>
                    <span>Security</span>
                </div>

                <div className="nav-buttons">
                    <button 
                        className="btn secondary"
                        onClick={() => navigate("/auth")}
                    >
                        Login
                    </button>

                    <button 
                        className="btn primary"
                        onClick={() => navigate("/auth")}
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
