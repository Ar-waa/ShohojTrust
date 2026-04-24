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
    const [mockAgreement, setMockAgreement] = useState(null);
    const [disputeStatus, setDisputeStatus] = useState("Draft"); // Default before submission

    useEffect(() => {
        // Fetch user from local storage to determine back route
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setUserRole(user.role);
        }

        // Mock fetching active agreement data
        // In a real scenario, we might fetch based on an agreement ID passed in state or URL
        setTimeout(() => {
            setMockAgreement({
                title: "Website Development Project",
                terms: "Complete homepage and 3 inner pages",
                deadline: "2026-05-15",
                payment: "$1,500.00",
                penalty: "5% deduction per week of delay"
            });
        }, 500);
    }, []);

    const handleBackClick = () => {
        if (userRole === "client") {
            navigate("/client-dashboard");
        } else if (userRole === "provider") {
            navigate("/provider-dashboard");
        } else {
            navigate("/");
        }
    };

    const handleDisputeSubmit = (disputeData) => {
        // Here you would typically send the data to your backend API
        console.log("Submitting dispute with data:", disputeData);
        
        // Mocking the backend response success
        setTimeout(() => {
            setDisputeStatus("Submitted");
            alert("Dispute submitted successfully!");
        }, 500);
    };

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

                    <div className="dispute-grid">
                        {/* LEFT SECTION */}
                        <div className="dispute-left">
                            <AgreementOverviewCard agreement={mockAgreement} />
                            
                            <DisputeForm onSubmit={handleDisputeSubmit} />
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
