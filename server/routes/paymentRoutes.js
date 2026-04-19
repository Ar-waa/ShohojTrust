const express = require("express");
const router = express.Router();
const {
  confirmPayment,
  getPaymentHistory,
  getPaymentByTransactionId,
  getPendingPayments,
  getProviderEarnings,
  cancelPayment
} = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// ✅ SPECIFIC ROUTES FIRST (before :param routes)
// CLIENT: Confirm/process a payment
router.post("/confirm", protect, authorize("client"), confirmPayment);

// CLIENT: Get pending payments for this client
router.get("/pending", protect, authorize("client"), getPendingPayments);

// PROVIDER: Get earnings summary
router.get("/provider/earnings", protect, authorize("provider"), getProviderEarnings);

// ✅ GENERIC ROUTES LAST (with :param)
// ANY AUTHENTICATED USER: Get payment history
router.get("/history", protect, getPaymentHistory);

// ANY AUTHENTICATED USER: Get payment by transaction ID
router.get("/:transactionId", protect, getPaymentByTransactionId);

// CLIENT: Cancel pending payment
router.delete("/:paymentId/cancel", protect, authorize("client"), cancelPayment);

module.exports = router;
