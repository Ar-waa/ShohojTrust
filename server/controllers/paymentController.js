const Payment = require("../models/Payment");
const Agreement = require("../models/Agreement");
const User = require("../models/User");
const AgreementAction = require("../models/AgreementAction");
const { generateTransactionId } = require("../utils/transactionUtils");
const { logEvent } = require("../services/eventService");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = require("stripe")(stripeSecretKey);

const isStripeConfigured = () =>
  stripeSecretKey && stripeSecretKey !== "your_stripe_secret_key";

const getFinalAmount = (agreement) => Number(agreement.adjustedAmount || agreement.amount || 0);

const getClientBaseUrl = () => process.env.CLIENT_URL || "http://localhost:5173";

const getStripeAmount = (amount) => {
  const multiplier = Number(process.env.STRIPE_AMOUNT_MULTIPLIER || 100);
  return Math.round(Number(amount) * multiplier);
};

const assertPayableAgreement = async ({ agreementId, clientEmail }) => {
  const agreement = await Agreement.findById(agreementId);

  if (!agreement) {
    const error = new Error("Agreement not found");
    error.statusCode = 404;
    throw error;
  }

  if (agreement.clientEmail !== clientEmail) {
    const error = new Error("You are not authorized to pay this agreement");
    error.statusCode = 403;
    throw error;
  }

  if (agreement.status !== "work_done") {
    const error = new Error("Only completed work (status: work_done) can be paid");
    error.statusCode = 400;
    throw error;
  }

  const existingPayment = await Payment.findOne({
    agreementId,
    status: "completed"
  });

  if (existingPayment) {
    const error = new Error("This agreement has already been paid");
    error.statusCode = 400;
    error.payment = existingPayment;
    throw error;
  }

  return agreement;
};

const buildPaymentResponse = (payment) => ({
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
});

const recordCompletedPayment = async ({
  req,
  agreement,
  agreementId,
  clientEmail,
  paymentMethod,
  transactionId
}) => {
  const finalAmount = getFinalAmount(agreement);

  const [clientUser, providerUser] = await Promise.all([
    User.findOne({ email: clientEmail }),
    User.findOne({ email: agreement.providerEmail })
  ]);

  const now = new Date();

  const payment = new Payment({
    agreementId,
    agreementTitle: agreement.title || "Untitled Agreement",
    agreementCategory: agreement.category || "",
    agreementDueDate: agreement.date || "",
    clientEmail,
    clientUserId: clientUser?._id,
    providerEmail: agreement.providerEmail,
    providerUserId: providerUser?._id,
    amount: finalAmount,
    adjustedAmount: finalAmount,
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

  agreement.status = "completed";
  await agreement.save();

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

  await updateTrustScores(clientEmail, agreement.providerEmail, finalAmount);
  await logEvent({
    user: {
      id: req.user?.id || null,
      email: req.user?.email || null,
      role: req.user?.role || null,
    },
    action: "MAKE_PAYMENT",
    agreementId: agreement._id || null,
  });

  return payment;
};

const confirmPayment = async (req, res) => {
  try {
    const { agreementId, paymentMethod, amount } = req.body;
    const clientEmail = req.user.email;

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ msg: "Amount must be a valid positive number" });
    }

    if (paymentMethod === "Stripe") {
      return res.status(400).json({ msg: "Use Stripe Checkout to complete Stripe payments" });
    }
    const agreement = await assertPayableAgreement({ agreementId, clientEmail });
    const payment = await recordCompletedPayment({
      req,
      agreement,
      agreementId,
      clientEmail,
      paymentMethod,
      transactionId: generateTransactionId()
    });

    res.status(201).json({
      msg: "Payment confirmed successfully",
      payment: buildPaymentResponse(payment)
    });

  } catch (err) {
    console.error("CONFIRM PAYMENT ERROR:", err);   // 👈 ADD THIS
  res.status(err.statusCode || 500).json({
    msg: err.message || "Payment processing failed"
  });
  }
};

const createStripeCheckoutSession = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ msg: "Stripe is not configured on the server" });
    }

    const { agreementId } = req.body;
    const clientEmail = req.user.email;
    const agreement = await assertPayableAgreement({ agreementId, clientEmail });
    const finalAmount = getFinalAmount(agreement);
    const clientBaseUrl = getClientBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: (process.env.STRIPE_CURRENCY || "bdt").toLowerCase(),
            product_data: {
              name: agreement.title || "ShohojTrust Agreement Payment",
              description: `Payment for agreement ${agreement._id}`
            },
            unit_amount: getStripeAmount(finalAmount)
          },
          quantity: 1
        }
      ],
      metadata: {
        agreementId: String(agreement._id),
        clientEmail,
        providerEmail: agreement.providerEmail,
        amount: String(finalAmount)
      },
      payment_intent_data: {
        metadata: {
          agreementId: String(agreement._id),
          clientEmail,
          providerEmail: agreement.providerEmail
        }
      },
      success_url: `${clientBaseUrl}/payment?stripe_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientBaseUrl}/payment?stripe_cancelled=true`
    });

    res.status(201).json({
      sessionId: session.id,
      url: session.url
    });
  } catch (err) {
    console.error("STRIPE CHECKOUT ERROR:", err);
    res.status(err.statusCode || 500).json({
      msg: err.message || "Failed to start Stripe checkout"
    });
  }
};

const confirmStripeCheckoutSession = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ msg: "Stripe is not configured on the server" });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ msg: "Stripe session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ msg: "Stripe payment has not been completed" });
    }

    const agreementId = session.metadata?.agreementId;
    const clientEmail = req.user.email;

    if (!agreementId || session.metadata?.clientEmail !== clientEmail) {
      return res.status(403).json({ msg: "Stripe session does not match this user" });
    }

    const existingPayment = await Payment.findOne({ agreementId, status: "completed" });

    if (existingPayment) {
      return res.json({
        msg: "Payment already recorded",
        payment: buildPaymentResponse(existingPayment)
      });
    }

    const agreement = await assertPayableAgreement({ agreementId, clientEmail });
    const payment = await recordCompletedPayment({
      req,
      agreement,
      agreementId,
      clientEmail,
      paymentMethod: "Stripe",
      transactionId: session.payment_intent || session.id
    });

    res.status(201).json({
      msg: "Stripe payment confirmed successfully",
      payment: buildPaymentResponse(payment)
    });
  } catch (err) {
    console.error("STRIPE CONFIRM ERROR:", err);
    res.status(err.statusCode || 500).json({
      msg: err.message || "Failed to confirm Stripe payment"
    });
  }
};

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

const getProviderEarnings = async (req, res) => {
  try {
    const providerEmail = req.user.email;

    const payments = await Payment.find({
      providerEmail,
      status: "completed"
    })
      .populate("agreementId", "title category")
      .sort({ completedAt: -1 });

    const totalEarnings = payments.reduce((sum, p) => sum + (p.adjustedAmount || p.amount),0);

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

const updateTrustScores = async (clientEmail, providerEmail, finalAmount) => {
  try {
    const trustIncrement = Math.min(5, Math.floor(finalAmount / 100)); // 1 point per 100 BDT (max 5)

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
    await logEvent({
    user: {
      id: req.user?.id || null,
      email: req.user?.email || null,
      role: req.user?.role || null,
    },
    action: "FAIL_PAYMENT",
    agreementId: payment.agreementId || null,
  });


    res.json({ msg: "Payment cancelled successfully", payment });

  } catch (err) {
    console.error("CANCEL PAYMENT ERROR:", err);
    res.status(500).json({ msg: "Failed to cancel payment", error: err.message });
  }
};

module.exports = {
  confirmPayment,
  createStripeCheckoutSession,
  confirmStripeCheckoutSession,
  getPaymentHistory,
  getPaymentByTransactionId,
  getPendingPayments,
  getProviderEarnings,
  cancelPayment
};
