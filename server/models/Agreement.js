const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema(
  {
    providerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    title: {
      type: String,
      trim: true,
      required: true,
    },

    terms: String,
    category: String,
    date: String,
    amount: String,
    penalty: String,

    // ✅ IMPORTANT STATUS FIELD
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agreement", agreementSchema);