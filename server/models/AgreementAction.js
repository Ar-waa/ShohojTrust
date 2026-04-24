const mongoose = require("mongoose");

const agreementActionSchema = new mongoose.Schema(
  {
    agreementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agreement",
      required: true,
    },

    providerEmail: {
      type: String,
      required: true,
      trim: true,
    },

    clientEmail: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔥 FINAL STATUS FIELD (IMPORTANT FOR UI CONTROL)
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "paid", "cancelled", "completed", "work_done"],
      default: "pending",
    },
  },
  { timestamps: true } // createdAt = timestamp of action
);

module.exports = mongoose.model("AgreementAction", agreementActionSchema);