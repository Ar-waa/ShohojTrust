const Event = require("../models/Event");
const Agreement = require("../models/Agreement");
const User = require("../models/User");
const { detectContext, classifyBehavior } = require("../utils/classifier");

async function logEvent({ user, action, agreementId }) {
    const agreement = await Agreement.findById(agreementId);

    if (!agreement) throw new Error("Agreement not found");

    const text = `${agreement.title} ${agreement.terms || ""}`;

    const context = detectContext(text);
    const behaviorCategory = classifyBehavior(action);

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

    return event;
}


module.exports = { logEvent };
