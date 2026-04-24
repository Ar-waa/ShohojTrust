const Payment = require("../models/Payment");
const Agreement = require("../models/Agreement");
const User = require("../models/User");
const AgreementAction = require("../models/AgreementAction");
const { generateTransactionId } = require("../utils/transactionUtils");

// ✅ CONFIRM PAYMENT
const confirmPayment = async (req, res) => {
  try {
    const { agreementId, paymentMethod, amount } = req.body;
    const clientEmail = req.user.email;

    if (!agreementId || !paymentMethod || !amount) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ msg: "Amount must be a valid positive number" });
    }

    // Verify agreement exists and belongs to this client
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ msg: "Agreement not found" });
    }

    if (agreement.clientEmail !== clientEmail) {
      return res.status(403).json({ msg: "You are not authorized to pay this agreement" });
    }

    if (agreement.status !== "work_done") {
      return res.status(400).json({ msg: "Only completed work (status: work_done) can be paid" });
    }

    // Check if payment already exists for this agreement
    const existingPayment = await Payment.findOne({
      agreementId,
      status: "completed"
    });

    if (existingPayment) {
      return res.status(400).json({ msg: "This agreement has already been paid" });
    }

    const [clientUser, providerUser] = await Promise.all([
      User.findOne({ email: clientEmail }),
      User.findOne({ email: agreement.providerEmail })
    ]);

    // Generate transaction ID
    const transactionId = generateTransactionId();
    const now = new Date();

    // Create payment record
    const payment = new Payment({
      agreementId,
      agreementTitle: agreement.title || "Untitled Agreement",
      agreementCategory: agreement.category || "",
      agreementDueDate: agreement.date || "",
      clientEmail,
      clientUserId: clientUser?._id,
      providerEmail: agreement.providerEmail,
      providerUserId: providerUser?._id,
      amount: parsedAmount,
      currency: "BDT",
      paymentMethod,
      status: "completed",
      transactionId,
      completedAt: now,
      paidAt: now,
      description: `Payment for agreement: ${agreement.title || "Untitled Agreement"}`,
      recordedBy: "system",
      metadata: {
        ipAddress: req.ip || "",
        userAgent: req.get("user-agent") || ""
      }
    });

    await payment.save();

    // Update agreement status straight to "completed"
    agreement.status = "completed";
    await agreement.save();

    // Log both events in the timeline simultaneously
    await AgreementAction.create([
      {
        agreementId,
        status: "paid",
        clientEmail,
        providerEmail: agreement.providerEmail,
      },
      {
        agreementId,
        status: "completed",
        clientEmail,
        providerEmail: agreement.providerEmail,
      }
    ]);

    // Update trust scores for both client and provider
    await updateTrustScores(clientEmail, agreement.providerEmail, parsedAmount);

    res.status(201).json({
      msg: "Payment confirmed successfully",
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paidAt: payment.paidAt,
        completedAt: payment.completedAt,
        agreementTitle: payment.agreementTitle,
        agreementCategory: payment.agreementCategory,
        agreementDueDate: payment.agreementDueDate,
        clientEmail: payment.clientEmail,
        providerEmail: payment.providerEmail
      }
    });

  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({ msg: "Payment processing failed", error: err.message });
  }
};

// ✅ GET PAYMENT HISTORY
const getPaymentHistory = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Get payments where user is client or provider
    const payments = await Payment.find({
      $or: [
        { clientEmail: userEmail },
        { providerEmail: userEmail }
      ]
    })
      .populate("agreementId", "title category amount")
      .sort({ createdAt: -1 });

    res.json({
      total: payments.length,
      payments
    });

  } catch (err) {
    console.error("PAYMENT HISTORY ERROR:", err);
    res.status(500).json({ msg: "Failed to fetch payment history", error: err.message });
  }
};

// ✅ GET PAYMENT BY TRANSACTION ID
const getPaymentByTransactionId = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId })
      .populate("agreementId", "title category amount");

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    // Verify user is authorized to view this payment
    if (payment.clientEmail !== req.user.email && payment.providerEmail !== req.user.email) {
      return res.status(403).json({ msg: "Unauthorized to view this payment" });
    }

    res.json(payment);

  } catch (err) {
    console.error("GET PAYMENT ERROR:", err);
    res.status(500).json({ msg: "Failed to fetch payment", error: err.message });
  }
};

// ✅ GET CLIENT PENDING PAYMENTS
const getPendingPayments = async (req, res) => {
  try {
    const clientEmail = req.user.email;

    // Get all work_done agreements for this client that haven't been paid yet
    const acceptedAgreements = await Agreement.find({
      clientEmail,
      status: "work_done"
    });

    const agreementIds = acceptedAgreements.map(a => a._id);

    // Check which ones have been paid
    const paidAgreementIds = await Payment.find({
      agreementId: { $in: agreementIds },
      status: "completed"
    }).distinct("agreementId");

    const paidIdSet = new Set(paidAgreementIds.map((id) => String(id)));

    // Return only unpaid agreements
    const pendingPayments = acceptedAgreements.filter(
      a => !paidIdSet.has(String(a._id))
    );

    res.json({
      pending: pendingPayments.length,
      agreements: pendingPayments
    });

  } catch (err) {
    console.error("PENDING PAYMENTS ERROR:", err);
    res.status(500).json({ msg: "Failed to fetch pending payments", error: err.message });
  }
};

// ✅ GET PROVIDER EARNINGS
const getProviderEarnings = async (req, res) => {
  try {
    const providerEmail = req.user.email;

    const payments = await Payment.find({
      providerEmail,
      status: "completed"
    })
      .populate("agreementId", "title category")
      .sort({ completedAt: -1 });

    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalEarnings,
      totalTransactions: payments.length,
      payments
    });

  } catch (err) {
    console.error("EARNINGS ERROR:", err);
    res.status(500).json({ msg: "Failed to fetch earnings", error: err.message });
  }
};

// ✅ HELPER: UPDATE TRUST SCORES
const updateTrustScores = async (clientEmail, providerEmail, paymentAmount) => {
  try {
    const trustIncrement = Math.min(5, Math.floor(paymentAmount / 100)); // 1 point per 100 BDT (max 5)

    // Update client trust score (paying on time)
    await User.findOneAndUpdate(
      { email: clientEmail },
      { $inc: { trustScore: trustIncrement } },
      { new: true }
    );

    // Update provider trust score (payment received)
    await User.findOneAndUpdate(
      { email: providerEmail },
      { $inc: { trustScore: trustIncrement } },
      { new: true }
    );

    console.log(`✅ Trust scores updated: ${clientEmail} and ${providerEmail} +${trustIncrement}`);

  } catch (err) {
    console.error("TRUST SCORE UPDATE ERROR:", err);
  }
};

// ✅ CANCEL PENDING PAYMENT (rare case)
const cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userEmail = req.user.email;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    if (payment.clientEmail !== userEmail) {
      return res.status(403).json({ msg: "Unauthorized to cancel this payment" });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ msg: "Only pending payments can be cancelled" });
    }

    payment.status = "failed";
    await payment.save();

    res.json({ msg: "Payment cancelled successfully", payment });

  } catch (err) {
    console.error("CANCEL PAYMENT ERROR:", err);
    res.status(500).json({ msg: "Failed to cancel payment", error: err.message });
  }
};

module.exports = {
  confirmPayment,
  getPaymentHistory,
  getPaymentByTransactionId,
  getPendingPayments,
  getProviderEarnings,
  cancelPayment
};
