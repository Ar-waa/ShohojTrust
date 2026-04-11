import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const ActiveAgreements = () => {
    const [agreements, setAgreements] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("agreements")) || [];
        setAgreements(stored);
    }, []);

    return (
        <div className="dashboard">

        <Sidebar />

        <div className="main">
            <Topbar />

            <div className="content">

            <div className="page-header">
                <div>
                <h2>Active Agreements</h2>
                <p className="subtext">All saved agreements are shown here</p>
                </div>
            </div>

            <div className="agreement-grid">

                {agreements.length === 0 ? (
                <p>No active agreements yet.</p>
                ) : (
                agreements.map((item, index) => (
                    <div className="agreement-card" key={index}>

                    <h3>{item.title}</h3>

                    <p><b>Category:</b> {item.category}</p>
                    <p><b>Amount:</b> {item.amount}</p>
                    <p><b>Penalty:</b> {item.penalty}%</p>

                    <p className="agreement-desc">
                        {item.terms}
                    </p>

                    </div>
                ))
                )}

            </div>

            </div>
        </div>

        </div>
    );
};

export default ActiveAgreements;
