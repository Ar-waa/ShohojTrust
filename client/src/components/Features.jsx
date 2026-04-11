import React from "react";

const Features = () => {
    const features = [
        {
        title: "Secure Agreements",
        desc: "Keep your agreements safe and verified.",
        },
        {
        title: "Smart Templates",
        desc: "Quickly create agreements using templates.",
        },
        {
        title: "Trust Score",
        desc: "Measure reliability with trust metrics.",
        },
    ];

    return (
        <section className="features">
        <div className="container feature-grid">
            {features.map((f, index) => (
            <div className="feature-card" key={index}>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
            </div>
            ))}
        </div>
        </section>
    );
    };

export default Features;
