const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
    
        user: {type: mongoose.Schema.Types.ObjectId,
        ref: "User", required: true,},
        role: { type: String, enum: ["client", "provider"], required: true },

        action: { type: String, required: true },

        agreementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agreement",
        required: true,
        },

        agreementTitle: String,

        behaviorCategory: {
        type: String,
        enum: ["positive", "neutral", "negative", "dispute"],
        },

        context: {
        type: String,
        enum: ["rental", "freelance", "marketplace", "service_booking", "general"],
        default: "general",
        },

        overridden: { type: Boolean, default: false },
        overrideReason: String,
    },
    { timestamps: true }
);

eventSchema.index({ agreementId: 1, behaviorCategory: 1 });

module.exports = mongoose.model("Event", eventSchema);
