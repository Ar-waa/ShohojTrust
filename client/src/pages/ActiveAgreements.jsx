import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";

const ActiveAgreements = () => {
    const [agreements, setAgreements] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await API.get("/agreements");
            setAgreements(res.data);
        } catch (err) {
            console.log(err);
        }
        };

        fetchData();
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
                agreements.map((a) => (
                    <div className="agreement-card" key={a._id}>

                    <h3>{a.title}</h3>

                    <p><b>Category:</b> {a.category}</p>
                    <p><b>Amount:</b> {a.amount}</p>
                    <p><b>Penalty:</b> {a.penalty}%</p>

                    <p className="agreement-desc">
                        {a.terms}
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
