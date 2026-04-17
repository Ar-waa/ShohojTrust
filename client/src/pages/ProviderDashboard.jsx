import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";

const ProviderDashboard = () => {

    const location = useLocation();
    const template = location.state?.template;
    const navigate = useNavigate();

    const [form, setForm] = useState({
        providerEmail: "",
        clientEmail: "",
        title: "",
        clientEmail: "",
        providerEmail: "",
        category: "",
        terms: "",
        date: "",
        amount: "",
        penalty: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const saveAgreement = () => {
        const existing = JSON.parse(localStorage.getItem("agreements")) || [];

        const newAgreement = {
            ...form,
            id: Date.now()
        };

        existing.push(newAgreement);

        localStorage.setItem("agreements", JSON.stringify(existing));

        alert("Agreement saved successfully!");
    };

    useEffect(() => {
        if (template) {
            setForm({
                title: template.title || "",
                clientEmail: "",
                providerEmail: "",
                category: template.category || "",
                terms: template.desc || "",
                date: "",
                amount: "",
                penalty: ""
            });
        }
    }, [template]);

    // ⭐ NEW BACKEND FUNCTION (ONLY ADDITION)
    const handlePreview = async () => {
        try {
            if (!form.clientEmail || !form.providerEmail) {
                alert("Please provide both client and provider email.");
                return;
            }

            const res = await fetch("http://localhost:5000/api/agreements/preview", {
                //const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agreements/preview`, {//
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to preview agreement");
            }

            // store backend response (IMPORTANT)
            localStorage.setItem("previewAgreement", JSON.stringify(data));

            navigate("/agreement-confirmation");

        } catch (error) {
            console.log("Preview error:", error);
            alert(error.message || "Preview failed");
        }
    };

    return (
        <div className="dashboard">

            <Sidebar />

            <div className="main">
                <Topbar />

                <div className="content">

                    <div className="page-header">
                        <div>
                            <h2>Create Agreement Template</h2>
                            <p className="subtext">Build structured and secure agreements</p>
                        </div>
                    </div>

                    <div className="dashboard-grid">

                        {/* LEFT SIDE */}
                        <div className="form-container">

                            <div className="card">
                                <h3>Basic Info</h3>

                    <input 
                    name="title"
                    placeholder="Template Title" 
                    value={form.title}
                    onChange={handleChange} 
                    />

                    <input
                    type="email"
                    name="clientEmail"
                    placeholder="Client Email"
                    value={form.clientEmail}
                    onChange={handleChange}
                    />

                    <input
                    type="email"
                    name="providerEmail"
                    placeholder="Provider Email"
                    value={form.providerEmail}
                    onChange={handleChange}
                    />

                                <select name="category" value={form.category} onChange={handleChange}>
                                    <option value="">Select Category</option>
                                    <option value="business">Business</option>
                                    <option value="personal">Personal</option>
                                </select>
                            </div>

                            <div className="card">
                                <h3>Agreement Terms</h3>

                                <textarea
                                    name="terms"
                                    placeholder="Write agreement terms..."
                                    value={form.terms}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="card">
                                <h3>Deadlines</h3>

                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                />

                                <button className="btn secondary small">
                                    + Add Milestone
                                </button>
                            </div>

                            <div className="card">
                                <h3>Payment Terms</h3>

                                <input
                                    name="amount"
                                    placeholder="Amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                />

                                <select>
                                    <option>Currency</option>
                                    <option>BDT</option>
                                    <option>USD</option>
                                </select>
                            </div>

                            <div className="card">
                                <h3>Penalty Conditions</h3>

                                <input
                                    name="penalty"
                                    placeholder="Penalty %"
                                    value={form.penalty}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                        {/* RIGHT SIDE */}
                        <div className="summary-card">

                            <h3>Summary</h3>

                            <div className="summary-item">
                                <strong>Title:</strong>
                                <p>{form.title || "Not set"}</p>
                            </div>

                <div className="summary-item">
                    <strong>Category:</strong>
                    <p>{form.category || "Not selected"}</p>
                </div>

                <div className="summary-item">
                    <strong>Client:</strong>
                    <p>{form.clientEmail || "Not set"}</p>
                </div>

                <div className="summary-item">
                    <strong>Provider:</strong>
                    <p>{form.providerEmail || "Not set"}</p>
                </div>

                            <div className="summary-item">
                                <strong>Amount:</strong>
                                <p>{form.amount || "0"}</p>
                            </div>

                            <div className="summary-item">
                                <strong>Penalty:</strong>
                                <p>{form.penalty || "0%"}</p>
                            </div>

                {/* 🔥 ONLY CHANGED BUTTON */}
                <button
                    className="btn primary full"
                    onClick={handlePreview}
                >
                    Preview
                </button>
                
                <button className="btn secondary full" onClick={saveAgreement}>
                    Save Draft
                </button>

                        </div>

                    </div>

                </div>
            </div>

        </div>
    );
};

export default ProviderDashboard;