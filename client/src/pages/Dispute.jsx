import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AgreementOverviewCard from "../components/AgreementOverviewCard";
import DisputeForm from "../components/DisputeForm";
import DisputeStatusCard from "../components/DisputeStatusCard";

import "../styles/Dispute.css";

const Dispute = () => {
    const navigate = useNavigate();
    
    const [userRole, setUserRole] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [selectedAgreementId, setSelectedAgreementId] = useState("");
    const [disputeStatus, setDisputeStatus] = useState("Draft"); 
    const [loading, setLoading] = useState(false);

    const apiBase = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setUserRole(user.role);
            fetchAgreements(user.email);
        }
    }, []);

    const fetchAgreements = async (userEmail) => {
        try {
            // Reusing the active agreements endpoint
            const endpoint = userEmail
                ? `${apiBase}/api/agreements/active?userEmail=${encodeURIComponent(userEmail)}`
                : `${apiBase}/api/agreements/active`;

            const res = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                const activeArr = (Array.isArray(data) ? data : []).filter(
                    a => a.status === "accepted" || a.status === "paid"
                );
                setAgreements(activeArr);
                if (activeArr.length > 0) {
                    setSelectedAgreementId(activeArr[0]._id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch agreements", err);
        }
    };

    const handleBackClick = () => {
        if (userRole === "client") {
            navigate("/client-dashboard");
        } else if (userRole === "provider") {
            navigate("/provider-dashboard");
        } else {
            navigate("/");
        }
    };

    const handleDisputeSubmit = async (disputeData) => {
        if (!selectedAgreementId) {
            alert("Please select an agreement first.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("agreementId", selectedAgreementId);
        formData.append("issueType", disputeData.issueType);
        formData.append("description", disputeData.description);
        
        if (disputeData.files && disputeData.files.length > 0) {
            for (let i = 0; i < disputeData.files.length; i++) {
                formData.append("evidenceFiles", disputeData.files[i]);
            }
        }

        try {
            const res = await fetch(`${apiBase}/api/disputes`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                    // Do not set Content-Type for FormData, browser sets it with boundary
                },
                body: formData
            });

            const result = await res.json();

            if (res.ok) {
                setDisputeStatus("Submitted");
                alert("Dispute submitted successfully!");
            } else {
                alert(result.message || "Failed to submit dispute");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Error submitting dispute.");
        } finally {
            setLoading(false);
        }
    };

    const selectedAgreement = agreements.find(a => a._id === selectedAgreementId) || null;

    return (
        <div className="dashboard">
            <Sidebar />
            
            <div className="main">
                <Topbar />
                
                <div className="dispute-container">
                    <div className="dispute-header">
                        <h2 className="dispute-title">Raise Dispute with Evidence</h2>
                        <button className="dispute-back-btn" onClick={handleBackClick}>
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </button>
                    </div>

                    {/* Agreement Selector */}
                    <div className="dispute-card" style={{ marginBottom: '24px' }}>
                        <h3 className="dispute-card-title">Select Agreement to Dispute</h3>
                        <select 
                            className="form-select" 
                            value={selectedAgreementId}
                            onChange={(e) => setSelectedAgreementId(e.target.value)}
                        >
                            <option value="">-- Choose an Agreement --</option>
                            {agreements.map(a => (
                                <option key={a._id} value={a._id}>
                                    {a.title} ({a.providerEmail})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="dispute-grid">
                        {/* LEFT SECTION */}
                        <div className="dispute-left">
                            <AgreementOverviewCard agreement={selectedAgreement} />
                            
                            <DisputeForm onSubmit={handleDisputeSubmit} disabled={loading} />
                        </div>
                        
                        {/* RIGHT SECTION */}
                        <div className="dispute-right">
                            <DisputeStatusCard currentStatus={disputeStatus === "Draft" ? "Submitted" : disputeStatus} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dispute;
