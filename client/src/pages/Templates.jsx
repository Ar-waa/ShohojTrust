import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const Templates = () => {
    const navigate = useNavigate();

    const templates = [
        {
        title: "Business Agreement",
        desc: "Standard business contract template",
        category: "Business"
        },
        {
        title: "Freelance Contract",
        desc: "For freelancers and clients",
        category: "Work"
        },
        {
        title: "Rental Agreement",
        desc: "Property rental contract template",
        category: "Legal"
        },
        {
        title: "Partnership Agreement",
        desc: "Startup / co-founder agreement",
        category: "Business"
        }
    ];

    return (
        <div className="dashboard">
        <Sidebar />

        <div className="main">
            <Topbar />

            <div className="content">

            {/* HEADER */}
            <div className="page-header">
                <div>
                <h2>Templates</h2>
                <p className="subtext">Choose a template to quickly create agreements</p>
                </div>

                <button className="btn primary">+ New Template</button>
            </div>

            {/* GRID */}
            <div className="template-grid">

                {templates.map((t, index) => (
                <div className="template-card" key={index}>

                    <div className="template-tag">{t.category}</div>

                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>

                    <div className="template-actions">
                    <button className="btn secondary">Preview</button>
                    <button className="btn primary" onClick={() => 
                        navigate("/provider-dashboard", { state: {template: t}})}>
                        Use
                    </button>

                    </div>

                </div>
                ))}

            </div>

            </div>
        </div>
        </div>
    );
};

export default Templates;
