const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema({
    providerEmail: {
        type: String,
        required: true,
    },

    clientEmail: {
        type: String,
        required: true,
    },

    title: String,
    category: String,
    terms: String,
    date: String,
    amount: String,
    penalty: String,

    // // ✅ ADDED STATUS FIELD (IMPORTANT)
    // status: {
    //     type: String,
    //     default: "pending",
    //     enum: ["pending", "accepted", "rejected"]
    // },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }

}, { timestamps: true });

module.exports = mongoose.model("Agreement", agreementSchema);