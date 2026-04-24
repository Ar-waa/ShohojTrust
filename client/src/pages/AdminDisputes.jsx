import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const AdminDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiBase}/api/disputes`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to fetch disputes");
            }

            setDisputes(data.data || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
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
                            <h2>Dispute Review</h2>
                            <p className="subtext">Review and manage disputes raised by clients and providers.</p>
                        </div>
                    </div>

                    <div className="aa-wrapper">
                        <div className="aa-card">
                            <div className="aa-card-header">
                                <h1>All Disputes</h1>
                                <p>Open disputes to see evidence and take action.</p>
                            </div>

                            {loading ? (
                                <div className="aa-empty">Loading disputes...</div>
                            ) : error ? (
                                <div className="aa-empty aa-error">{error}</div>
                            ) : disputes.length === 0 ? (
                                <div className="aa-empty">No disputes found.</div>
                            ) : (
                                <table className="aa-table">
                                    <thead>
                                        <tr>
                                            <th>Agreement Title</th>
                                            <th>Raised By</th>
                                            <th>Issue Type</th>
                                            <th>Evidence</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {disputes.map((dispute) => (
                                            <tr key={dispute._id}>
                                                <td>{dispute.agreementId?.title || "Unknown Agreement"}</td>
                                                <td><span className="aa-email">{dispute.userEmail}</span></td>
                                                <td>{dispute.issueType}</td>
                                                <td>{dispute.evidenceFiles?.length || 0} files</td>
                                                <td>
                                                    <span className={`aa-badge pending`}>
                                                        {dispute.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn primary"
                                                        onClick={() => navigate(`/admin/disputes/${dispute._id}`)}
                                                    >
                                                        Open
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDisputes;
