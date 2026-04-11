import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="hero">
        <div className="container hero-content">
            <h1>Build Trust Through Smart Agreements</h1>
            <p>
            Create, manage, and track agreements with an intelligent trust system.
            </p>
            <div className="hero-buttons">
            <button 
                className="btn primary"
                onClick={() => navigate("/auth")}
            >
                Get Started
            </button>

            <button className="btn secondary">
                Learn More
            </button>
            </div>
        </div>
        </section>
    );
};

export default Hero;
