import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Lock } from "lucide-react";

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="hero">
            <div className="container hero-content">
                <div className="hero-text">
                    <h1>Build Trust Through Smart Agreements</h1>
                    <p>
                        A modern, secure platform to create, manage, and track professional agreements with an intelligent trust score system.
                    </p>
                    <div className="hero-buttons">
                        <button 
                            className="btn primary"
                            onClick={() => navigate("/auth")}
                        >
                            Get Started
                        </button>

                        <button className="btn outline">
                            Learn More
                        </button>
                    </div>
                </div>
                <div className="hero-image">
                    {/* Placeholder for line-art technical illustration */}
                    <div style={{ display: 'flex', position: 'relative' }}>
                        <FileText size={160} strokeWidth={1} style={{ color: '#93c5fd', transform: 'rotate(-10deg)', position: 'absolute', right: '40px', top: '-20px' }} />
                        <Lock size={120} strokeWidth={1.5} style={{ color: '#2563eb', zIndex: 10 }} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
