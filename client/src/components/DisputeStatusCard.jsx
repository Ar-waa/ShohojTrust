import React from "react";
import { Check } from "lucide-react";

const DisputeStatusCard = ({ currentStatus }) => {
    const statuses = [
        { id: "Submitted", label: "Submitted", desc: "Dispute has been logged" },
        { id: "Under Review", label: "Under Review", desc: "Admin is reviewing the case" },
        { id: "Evidence Submitted", label: "Evidence Submitted", desc: "Additional evidence provided" },
        { id: "Resolved", label: "Resolved", desc: "Dispute closed" }
    ];

    // Simple logic to determine if a step is completed, active, or pending
    const getStepState = (index) => {
        const currentIndex = statuses.findIndex(s => s.id === currentStatus);
        
        if (currentIndex === -1) return "pending"; // default if status unknown
        
        if (index < currentIndex) return "completed";
        if (index === currentIndex) return "active";
        return "pending";
    };

    return (
        <div className="dispute-card" style={{ position: 'sticky', top: '24px' }}>
            <h3 className="dispute-card-title">Dispute Status</h3>
            
            <div className="status-timeline">
                {statuses.map((status, index) => {
                    const state = getStepState(index);
                    const isLast = index === statuses.length - 1;
                    
                    return (
                        <div className="status-step" key={status.id}>
                            {!isLast && <div className="status-line"></div>}
                            
                            <div className="status-indicator">
                                <div className={`status-dot ${state}`}>
                                    {state === "completed" && <Check size={14} strokeWidth={3} />}
                                    {state === "active" && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }}></div>}
                                </div>
                            </div>
                            
                            <div className="status-content">
                                <div className={`status-title ${state}`}>
                                    {status.label}
                                </div>
                                <div className="status-desc">
                                    {status.desc}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DisputeStatusCard;
