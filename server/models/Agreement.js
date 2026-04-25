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

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "paid", "cancelled", "completed", "work_done"],
      default: "pending",
    },

      deadlineDate: {
    type: Date
  },
  penaltyPercent: {
    type: Number,
    default: 0
  },
  lastPenaltyAppliedAt: {
    type: Date
  },
  violationType: {
    type: String,
    enum: ["provider", "client", null],
    default: null
  },
  penaltyAccumulated: {
    type: Number,
    default: 0
  },
  deadlineMissedNotified: {
    type: Boolean,
    default: false
  },
  penaltyAccumulatedIntervals: {
    type: Number,
    default: 0
  }, 
  approachingNotified: {
  type: Boolean,
  default: false
  },
      adjustedAmount: {
  type: Number,
  default: null
  }
  
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("Agreement", agreementSchema);