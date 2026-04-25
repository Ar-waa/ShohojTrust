import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import PaymentSuccessModal from "../components/PaymentSuccessModal";
import "./Payment.css";

const Payment = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [isProcessing, setIsProcessing] = useState(false);

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    transactionId: "",
    amount: 0,
    paymentMethod: ""
  });

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userEmail = user?.email ? encodeURIComponent(user.email) : "";
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const endpoint = userEmail
        ? `${apiBase}/api/agreements/active?userEmail=${userEmail}`
        : `${apiBase}/api/agreements/active`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch agreements");

      const data = await res.json();

      const workDoneAgreements = (Array.isArray(data) ? data : []).filter(
        (a) => a.status === "work_done"
      );

      setAgreements(workDoneAgreements);
    } catch (err) {
      console.error("Error fetching agreements:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED PAYMENT FUNCTION
  const handleConfirmPayment = async () => {
    if (!selectedAgreement) {
      alert("Please select an agreement");
      return;
    }

    setIsProcessing(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const finalAmount = Number(
        selectedAgreement?.adjustedAmount ??
        selectedAgreement?.amount ??
        0
      );

      const res = await fetch(`${apiBase}/api/payments/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          agreementId: selectedAgreement?._id,
          amount: finalAmount,
          paymentMethod: paymentMethod
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Payment failed");
      }

      // ✅ USE CORRECT AMOUNT SOURCE
      setSuccessModal({
        isOpen: true,
        transactionId: data.payment.transactionId,
        amount: finalAmount,
        paymentMethod: paymentMethod
      });

      setTimeout(() => {
        setSelectedAgreement(null);
        setPaymentMethod("bKash");
        fetchAgreements();
      }, 500);

    } catch (err) {
      console.error("Payment error:", err);
      alert(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Topbar />

        <div className="content">
          <div className="payment-wrapper">

            <div className="payment-header">
              <h1>💳 Payment</h1>
              <p>Complete your payment for an active agreement</p>
            </div>

            {loading ? (
              <div className="payment-card">
                <div className="aa-empty">Loading agreements...</div>
              </div>
            ) : (
              <div className="payment-card">

                {!selectedAgreement ? (

                  <div>
                    <div className="payment-section">
                      <label className="payment-label">Select Agreement</label>

                      <div className="agreement-list">
                        {agreements.length === 0 ? (
                          <p className="aa-empty">
                            No completed work available for payment.
                          </p>
                        ) : (
                          agreements.map((agr) => (
                            <div
                              key={agr._id}
                              className={`agreement-item ${
                                selectedAgreement?._id === agr._id ? "selected" : ""
                              }`}
                              onClick={() => setSelectedAgreement(agr)}
                            >
                              <div className="agreement-info">
                                <p className="agreement-title">
                                  {agr.title || "Untitled"}
                                </p>
                                <p className="agreement-provider">
                                  Provider: {agr.providerEmail}
                                </p>
                              </div>

                              <div className="agreement-amount">
                                <span className="amount-label">Amount</span>
                                <span className="amount-value">
                                  ৳{Number(agr.adjustedAmount ?? agr.amount ?? 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                ) : (

                  <div>

                    <div className="payment-section">
                      <label className="payment-label">Agreement ID</label>
                      <input
                        type="text"
                        className="payment-input"
                        value={selectedAgreement?._id || ""}
                        disabled
                      />
                    </div>

                    <div className="payment-row">
                      <div className="payment-section">
                        <label className="payment-label">Provider</label>
                        <p className="payment-value">
                          {selectedAgreement?.providerEmail}
                        </p>
                      </div>

                      <div className="payment-section">
                        <label className="payment-label">Due Date</label>
                        <p className="payment-value">
                          {new Date(selectedAgreement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="payment-section">
                      <label className="payment-label">Amount (BDT ৳)</label>
                      <input
                        type="number"
                        className="payment-input"
                        value={
                          selectedAgreement?.adjustedAmount ??
                          selectedAgreement?.amount ??
                          ""
                        }
                        disabled
                      />
                    </div>

                    <div className="payment-section">
                      <label className="payment-label">Payment method</label>
                      <select
                        className="payment-select"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>

                    <div className="payment-section">
                      <label className="payment-label">Total to pay</label>
                      <div className="total-amount">
                        ৳{Number(
                          selectedAgreement?.adjustedAmount ??
                          selectedAgreement?.amount ??
                          0
                        ).toFixed(2)}
                      </div>
                    </div>

                    <button
                      className="btn-confirm-payment"
                      onClick={handleConfirmPayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Confirm payment 🔒"}
                    </button>

                    <button
                      className="btn-back-payment"
                      onClick={() => setSelectedAgreement(null)}
                      disabled={isProcessing}
                    >
                      ← Back
                    </button>

                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ✅ FIXED MODAL */}
      <PaymentSuccessModal
        isOpen={successModal.isOpen}
        transactionId={successModal.transactionId}
        amount={Number(successModal.amount || 0).toFixed(2)}
        paymentMethod={successModal.paymentMethod}
        onClose={() =>
          setSuccessModal({ ...successModal, isOpen: false })
        }
      />

    </div>
  );
};

export default Payment;