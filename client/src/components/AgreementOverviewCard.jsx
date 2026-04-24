import React from "react";

const AgreementOverviewCard = ({ agreement }) => {
    if (!agreement) return null;

    return (
        <div className="dispute-card">
            <h3 className="dispute-card-title">Confirm Agreement</h3>
            
            <div className="agreement-data-grid">
                <div className="data-item">
                    <span className="data-label">Title</span>
                    <span className="data-value">{agreement.title}</span>
                </div>
                
                <div className="data-item">
                    <span className="data-label">Terms</span>
                    <span className="data-value">{agreement.terms}</span>
                </div>
                
                <div className="data-item">
                    <span className="data-label">Deadline</span>
                    <span className="data-value">{agreement.deadline}</span>
                </div>
                
                <div className="data-item">
                    <span className="data-label">Payment</span>
                    <span className="data-value">{agreement.payment}</span>
                </div>
                
                <div className="data-item">
                    <span className="data-label">Penalty</span>
                    <span className="data-value">{agreement.penalty}</span>
                </div>
            </div>
        </div>
    );
};

export default AgreementOverviewCard;
