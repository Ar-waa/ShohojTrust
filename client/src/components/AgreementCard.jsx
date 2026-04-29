import { useState } from "react";
import axios from "axios";

export default function AgreementCard({ agreement, onUpdate }) {
  const [status, setStatus] = useState(agreement.status || "pending");
  const [loading, setLoading] = useState(false);

  const handleAction = async (newStatus) => {
    try {
      if (loading || status !== "pending") return;

      setLoading(true);

      const res = await axios.patch(
        `http://https://shohojtrust.onrender.com//api/agreements/${agreement._id}/status`,
        { status: newStatus }
      );

      // ==========================
      // FIX: backend returns { agreement, action }
      // ==========================
      const updatedAgreement = res.data.agreement;

      setStatus(updatedAgreement.status || newStatus);

      // 🔥 update parent list instantly (IMPORTANT FOR ACTIVE PAGE)
      if (onUpdate) {
        onUpdate(updatedAgreement);
      }

    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex-1">

      <h2 className="text-xl font-bold mb-4">
        Agreement Summary
      </h2>

      {/* ==========================
          STATUS BADGE
      ========================== */}
      <div className="mb-3">
        {status === "pending" && (
          <span className="text-yellow-600 font-semibold">
            🟡 Pending
          </span>
        )}

        {status === "accepted" && (
          <span className="text-green-600 font-semibold">
            🟢 Accepted
          </span>
        )}

        {status === "rejected" && (
          <span className="text-red-600 font-semibold">
            🔴 Rejected
          </span>
        )}
      </div>

      {/* ==========================
          DETAILS
      ========================== */}
      <div className="border-2 border-blue-400 bg-gray-50 p-4 rounded-md space-y-2">

        <p><b>Title:</b> {agreement.title}</p>
        <p><b>Terms:</b> {agreement.terms}</p>
        <p><b>Deadline:</b> {agreement.date}</p>
        <p><b>Payment:</b> {agreement.amount}</p>
        <p><b>Penalty:</b> {agreement.penalty}</p>

      </div>

      {/* ==========================
          ACTION BUTTONS
      ========================== */}
      <div className="flex gap-3 mt-4">

        {/* ACCEPT */}
        {status === "pending" && (
          <button
            onClick={() => handleAction("accepted")}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
          >
            {loading ? "Processing..." : "✅ Accept"}
          </button>
        )}

        {/* REJECT */}
        {status === "pending" && (
          <button
            onClick={() => handleAction("rejected")}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
          >
            {loading ? "Processing..." : "❌ Reject"}
          </button>
        )}

        {/* FINAL STATE */}
        {status !== "pending" && (
          <p className="text-sm font-semibold text-gray-600 mt-2">
            Decision is final
          </p>
        )}

        {/* OPTIONAL ACTIONS */}
        <button className="bg-gray-200 px-3 py-2 rounded text-sm ml-auto">
          📄 Download PDF
        </button>

        <button className="bg-gray-200 px-3 py-2 rounded text-sm">
          📧 Send to Email
        </button>

      </div>

    </div>
  );
}