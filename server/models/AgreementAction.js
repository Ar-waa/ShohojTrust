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
    },

    clientEmail: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["accepted", "rejected"],
      required: true,
    },
  },
  { timestamps: true } // 👈 this gives createdAt (your timestamp)
);

module.exports = mongoose.model("AgreementAction", agreementActionSchema);