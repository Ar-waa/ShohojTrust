import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AgreementOverviewCard from "../components/AgreementOverviewCard";

const AdminDisputeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dispute, setDispute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        fetchDisputeDetails();
    }, [id]);

    const fetchDisputeDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiBase}/api/disputes/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to fetch dispute details");
            }

            setDispute(data.data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!window.confirm("Are you sure you want to resolve and remove this dispute?")) return;

        try {
            const res = await fetch(`${apiBase}/api/disputes/${id}/resolve`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                alert("Dispute resolved successfully.");
                navigate("/admin/disputes");
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error resolving dispute.");
        }
    };

    const handleCancelAgreement = async () => {
        if (!window.confirm("Are you sure you want to cancel the agreement and apply the penalty?")) return;

        try {
            const res = await fetch(`${apiBase}/api/disputes/${id}/cancel-agreement`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                alert("Agreement cancelled and penalty applied successfully.");
                navigate("/admin/disputes");
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error cancelling agreement.");
        }
    };

    if (loading) return <div className="dashboard"><Sidebar /><div className="main"><Topbar /><div className="content">Loading...</div></div></div>;
    if (error) return <div className="dashboard"><Sidebar /><div className="main"><Topbar /><div className="content">Error: {error}</div></div></div>;
    if (!dispute) return <div className="dashboard"><Sidebar /><div className="main"><Topbar /><div className="content">Dispute not found.</div></div></div>;

    const agreement = dispute.agreementId;

    return (
        <div className="dashboard">
            <Sidebar />
            
            <div className="main">
                <Topbar />
                
                <div className="content">
                    <div className="page-header" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <button className="btn secondary small" onClick={() => navigate("/admin/disputes")}>
                            &larr; Back
                        </button>
                        <div>
                            <h2>Dispute Details</h2>
                            <p className="subtext">Review evidence and take action.</p>
                        </div>
                    </div>

                    <div className="dispute-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* LEFT: Agreement Details */}
                        <div>
                            <AgreementOverviewCard agreement={agreement} />
                            
                            <div className="dispute-card" style={{ marginTop: '20px' }}>
                                <h3>Actions</h3>
                                <p className="subtext" style={{ marginBottom: '15px' }}>
                                    Resolve removes the dispute. Cancel Agreement applies a -5 trust score penalty and cancels the contract.
                                </p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn primary" onClick={handleResolve} style={{ background: '#10b981' }}>
                                        Resolve
                                    </button>
                                    <button className="btn primary danger" onClick={handleCancelAgreement}>
                                        Cancel Agreement
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Dispute Info & Evidence */}
                        <div className="dispute-card">
                            <h3 className="dispute-card-title">Issue Reported</h3>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Raised By: </strong> {dispute.userEmail}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Issue Type: </strong> {dispute.issueType}
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <strong>Description: </strong> 
                                <p style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginTop: '5px' }}>
                                    {dispute.description}
                                </p>
                            </div>

                            <h3 className="dispute-card-title">Evidence Files</h3>
                            {dispute.evidenceFiles && dispute.evidenceFiles.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {dispute.evidenceFiles.map((file, idx) => {
                                        const isCloudinary = file.startsWith("http");
                                        const fileUrl = isCloudinary ? file : `${apiBase}${file}`;
                                        const isImage = file.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null || (isCloudinary && file.includes('/image/upload/'));
                                        
                                        return (
                                            <div key={idx} style={{ border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px' }}>
                                                {isImage ? (
                                                    <img src={fileUrl} alt="Evidence" style={{ maxWidth: '100%', borderRadius: '4px' }} />
                                                ) : (
                                                    <a href={fileUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                                                        View Document {idx + 1}
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="subtext">No evidence files provided.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDisputeDetails;
