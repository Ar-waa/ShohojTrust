const Event = require("../models/Event");
const Agreement = require("../models/Agreement");
const { detectContext, classifyBehavior } = require("../utils/classifier");
const { calculateTrustScore } = require("./trustServices.js");

async function logEvent({ user, action, agreementId }) {
    try {
        const agreement = await Agreement.findById(agreementId);

        if (!agreement) throw new Error("Agreement not found");

        const text = `${agreement.title || ""} ${agreement.terms || ""}`;

        const context = detectContext(text);
        const behaviorCategory = classifyBehavior(action);

        // ==========================
        // SAVE EVENT
        // ==========================
        const event = await Event.create({
            user: user.id,
            role: user.role,
            action,
            agreementId,
            agreementTitle: agreement.title,
            userEmailSnapshot: user.email,
            context,
            behaviorCategory,
        });

        const userId = user._id || user.id;

        if (userId) {
          await calculateTrustScore(userId);
        }

        // ==========================
        // TRUST SCORE UPDATE
        // ==========================

        return event;

    } catch (err) {
        console.error("logEvent error:", err.message);
        return null;
    }
}

module.exports = { logEvent };