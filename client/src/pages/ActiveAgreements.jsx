import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./ActiveAgreements.css";

/**
 * @typedef {Object} AgreementItem
 * @property {string} _id
 * @property {string} title
 * @property {string} clientEmail
 * @property {string} providerEmail
 * @property {"accepted" | "rejected" | "pending"} status
 */

const ActiveAgreements = () => {
    const navigate = useNavigate();
    /** @type {[AgreementItem[], Function]} */
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAgreements = async () => {
            try {
                setLoading(true);
                setError("");

                const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
                const user = JSON.parse(localStorage.getItem("user") || "null");
                const userEmail = user?.email ? encodeURIComponent(user.email) : "";
                const endpoint = userEmail
                    ? `${apiBase}/api/agreements/active?userEmail=${userEmail}`
                    : `${apiBase}/api/agreements/active`;

                const res = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                    }
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.msg || errData.error || "Failed to fetch active agreements");
                }

                const data = await res.json();
                setAgreements(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message || "Something went wrong");
                setAgreements([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAgreements();
    }, []);

    const acceptedCount = agreements.filter((item) => item.status === "accepted").length;
    const rejectedCount = agreements.filter((item) => item.status === "rejected").length;

    return (
        <div className="dashboard">

            <Sidebar />

            <div className="main">
                <Topbar />

                <div className="content">

                    <div className="aa-wrapper">
                        <div className="aa-card">

                            <div className="aa-card-header">
                                <h1>Active Agreements</h1>
                                <p>Click an agreement to view its activity timeline</p>
                            </div>

                            {loading ? (
                                <div className="aa-empty">Loading agreements...</div>
                            ) : (
                                <>
                                    <table className="aa-table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Client Email</th>
                                                <th>Provider Email</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {error ? (
                                                <tr>
                                                    <td colSpan="4" className="aa-empty aa-error">
                                                        {error}
                                                    </td>
                                                </tr>
                                            ) : agreements.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="aa-empty">
                                                        No active agreements yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                agreements.map((item) => (
                                                    <tr
                                                        key={item._id}
                                                        onClick={() =>
                                                            navigate(`/agreement-activity-timeline/${item._id}`)
                                                        }
                                                        style={{ cursor: "pointer" }}
                                                    >

                                                        <td>{item.title || "Untitled Agreement"}</td>

                                                        <td><span className="aa-email">{item.clientEmail}</span></td>
                                                        <td><span className="aa-email">{item.providerEmail}</span></td>
                                                        <td>
                                                            <span className={`aa-badge ${item.status || "pending"}`}>
                                                                <span className="aa-badge-icon">
                                                                    {item.status === "accepted"
                                                                        ? "✔"
                                                                        : item.status === "rejected"
                                                                        ? "✕"
                                                                        : "⏳"}
                                                                </span>
                                                                {item.status === "accepted"
                                                                    ? "Accepted"
                                                                    : item.status === "rejected"
                                                                    ? "Rejected"
                                                                    : "Pending"}
                                                            </span>
                                                        </td>

                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                    <div className="aa-card-footer">
                                        <span>Showing {agreements.length} agreements</span>
                                        <span className="aa-count-pill">
                                            {acceptedCount} Accepted · {rejectedCount} Rejected
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default ActiveAgreements;