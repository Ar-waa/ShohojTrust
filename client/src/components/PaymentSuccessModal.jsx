import React from "react";
import { CheckCircle2, X } from "lucide-react";
import "./PaymentSuccessModal.css";

const PaymentSuccessModal = ({ isOpen, transactionId, amount, paymentMethod, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-body">
          <CheckCircle2 size={64} className="success-icon" />
          
          <h2 className="modal-title">Payment Successful! 🎉</h2>
          
          <p className="modal-subtitle">Your payment has been processed successfully.</p>
          
          <div className="payment-details">
            <div className="detail-row">
              <span className="detail-label">Amount Paid:</span>
              <span className="detail-value">৳{amount}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{paymentMethod}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Transaction ID:</span>
              <span className="detail-value transaction-id">{transactionId}</span>
            </div>
          </div>

          <div className="success-message">
            ✓ Payment is recorded & timestamped
            <br />
            ↑ Your trust score will update shortly
          </div>

          <button className="modal-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
