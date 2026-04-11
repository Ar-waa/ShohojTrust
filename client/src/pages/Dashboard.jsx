import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";

const Dashboard = () => {

    const location = useLocation();
    const template = location.state?.template;
    const navigate = useNavigate();

    const [form, setForm] = useState({
        providerEmail: "",
        clientEmail: "",
        title: "",
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

    const saveDraft = () => {
        localStorage.setItem("draftAgreement", JSON.stringify(form));
        window.location.reload();
    };

    // const saveAgreement = async () => {
    //     try {
    //         await API.post("/agreements", form);
    //         alert("Agreement saved!");

    //         // optional: clear draft after real save
    //         localStorage.removeItem("draftAgreement");

    //     } catch (err) {
    //         console.log(err.response?.data || err.message);
    //         alert("Failed to save agreement");
    //     }
    // };


    useEffect(() => {
        const savedDraft = localStorage.getItem("draftAgreement");

        if (savedDraft) {
            setForm(JSON.parse(savedDraft));
        }
    }, []);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user?.email) {
            setForm((prev) => ({
                ...prev,
                providerEmail: user.email
            }));
        }
    }, []);

    useEffect(() => {
        const savedDraft = localStorage.getItem("draftAgreement");

        if (template && !savedDraft) {
            setForm((prev) => ({
                ...prev,
                title: template.title || "",
                category: template.category || "",
                terms: template.desc || ""
            }));
        }
    }, [template]);

    // ⭐ NEW BACKEND FUNCTION (ONLY ADDITION)
    const handlePreview = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/agreements/preview", {
                //const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agreements/preview`, {//
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            // store backend response (IMPORTANT)
            localStorage.setItem("previewAgreement", JSON.stringify(data));

            navigate("/agreement-confirmation");

        } catch (error) {
            console.log("Preview error:", error);
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
                                    value={form.providerEmail}
                                    disabled
                                />

                                <input
                                    name="clientEmail"
                                    placeholder="Client Email"
                                    value={form.clientEmail}
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

export default Dashboard;


        // const saveAgreement = async () => {
        // try {
        //     await API.post("/agreements", form);

        //     alert("Agreement saved!");
        // } catch (err) {
        //     console.log(err.response?.data || err.message);
        //     alert("Failed to save agreement");
        // }
        // };