import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const ProviderDashboard = () => {

    const location = useLocation();
    const template = location.state?.template;

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

    // ==========================
    // ✅ FIXED SAVE DRAFT API CALL
    // ==========================
    const saveAgreement = async () => {
    try {
    const res = await fetch("http://localhost:5000/api/agreements/draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.msg || "Failed to save draft");
    }

    alert("Draft sent to client successfully!");

  } catch (err) {
    console.log(err);
    alert(err.message);
  }
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

    return (
        <div className="dashboard">

            <Sidebar />

            <div className="main">
                <Topbar />

                <div className="content">

                    <div className="page-header">
                        <div>
                            <h2>Create Agreement Template</h2>
                            <p className="subtext">
                                Build structured and secure agreements
                            </p>
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

                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                >
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
                            </div>

                            <div className="card">
                                <h3>Payment Terms</h3>

                                <input
                                    name="amount"
                                    placeholder="Amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                />
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

                            <button
                                className="btn secondary full"
                                onClick={saveAgreement}
                            >
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