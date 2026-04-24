const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
    agreementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agreement",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    issueType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    evidenceFiles: {
      type: [String], // Array of file paths/URLs
      default: [],
    },
    status: {
      type: String,
      enum: ["submitted", "under_review", "resolved"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dispute", disputeSchema);
