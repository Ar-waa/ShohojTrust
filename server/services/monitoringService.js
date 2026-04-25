const Agreement = require("../models/Agreement");
const penaltyService = require("./penaltyService");
const notificationService = require("./notificationService");
const { logEvent } = require("./eventService");

exports.monitorDeadlines = async () => {
    const now = new Date();

    const agreements = await Agreement.find({status: { $in: ["accepted", "work_done"] }});
    console.log("AGREEMENTS FOUND:", agreements.length);

    for (const agr of agreements) {
        const deadline = new Date(agr.date);

        const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
        await penaltyService.handlePenalty(agr);
        // ==========================
        // APPROACHING DEADLINE (2 DAYS)
        // ==========================
        if (diffDays <= 2 && diffDays > 0 && !agr.approachingNotified) {

        await notificationService.notify("deadline_approaching", agr);

        agr.approachingNotified = true;
        await agr.save();
}

        // ==========================
        // MISSED DEADLINE
        // ==========================
        if (now > deadline) {

    // Notify ONLY ONCE
    if (!agr.deadlineMissedNotified) {
        await notificationService.notify("deadline_missed", agr);
            await logEvent({
        user: {
            id: null,
            email: agr.providerEmail,
            role: "system"
        },
        action: "DEADLINE_MISSED",
        agreementId: agr._id,
    });
        agr.deadlineMissedNotified = true;
        await agr.save();
    }

    // Apply penalty every interval
    await penaltyService.handlePenalty(agr);
    await logEvent({
    user: {
        id: null,
        email: violationType === "provider" ? agr.providerEmail : agr.clientEmail,
        role: "system"
        },
        action: "PENALTY_APPLIED",
        agreementId: agr._id,
    });
    }
    }
};