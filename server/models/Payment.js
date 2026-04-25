const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    agreementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agreement",
      required: true,
      index: true
    },

    agreementTitle: {
      type: String,
      required: true,
      trim: true
    },

    agreementCategory: {
      type: String,
      default: ""
    },

    agreementDueDate: {
      type: String,
      default: ""
    },

    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    clientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    providerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    providerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "BDT",
      uppercase: true,
      trim: true
    },

    paymentMethod: {
      type: String,
      enum: ["bKash", "Nagad", "Rocket", "Bank Transfer", "Stripe"],
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    paidAt: {
      type: Date
    },

    recordedBy: {
      type: String,
      default: "system"
    },

    metadata: {
      ipAddress: { type: String, default: "" },
      userAgent: { type: String, default: "" }
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    completedAt: {
      type: Date
    },

  penaltyAccumulated: {
    type: Number,
    default: 0
  },
  },
  { timestamps: true }
);

paymentSchema.index(
  { agreementId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "completed" }
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
