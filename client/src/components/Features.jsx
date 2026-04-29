import React from "react";
import { ShieldCheck, FileSignature, Activity } from "lucide-react";

const Features = () => {
    const features = [
        {
            icon: <ShieldCheck size={28} />,
            title: "Secure Agreements",
            desc: "Keep your agreements safe and verified with cryptographic-level security.",
        },
        {
            icon: <FileSignature size={28} />,
            title: "Smart Templates",
            desc: "Quickly create standardized agreements using smart, flexible templates.",
        },
        {
            icon: <Activity size={28} />,
            title: "Trust Score",
            desc: "Measure reliability with robust trust metrics and behavioral analytics.",
        },
    ];

    return (
        <section className="features">
            <div className="container feature-grid">
                {features.map((f, index) => (
                    <div className="feature-card" key={index}>
                        <div className="feature-icon">
                            {f.icon}
                        </div>
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
