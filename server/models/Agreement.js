const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema(
  {
    providerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    title: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
    },

    terms: {
      type: String,
    },

    date: {
      type: String,
    },

    amount: {
      type: String,
    },

    penalty: {
      type: String,
    },

    // ==========================
    // MAIN STATUS (IMPORTANT)
    // ==========================
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agreement", agreementSchema);