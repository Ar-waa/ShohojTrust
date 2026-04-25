const Payment = require("../models/Payment");
const Agreement = require("../models/Agreement");
const { logEvent } = require("./eventService");
const notificationService = require("./notificationService");

exports.handlePenalty = async (agr) => {
    try {
        const now = new Date();
        const deadline = new Date(agr.date);
        let violationType = null;

        if (isNaN(deadline.getTime())) {
        console.log("Invalid deadline for agreement:", agr._id);
        return;
        }
        // ==========================
        // STEP 1: DETERMINE VIOLATION TYPE
        // ==========================


        // ==========================
        // CLIENT FAILURE (priority)
        // ==========================
        if (agr.status === "work_done") {
        const delayDays = (now - deadline) / (1000 * 60 * 60 * 24);

        if (delayDays > 2) {
            violationType = "client";
        }
        }

        // ==========================
        // PROVIDER FAILURE
        // ==========================
        else if (
        agr.status !== "completed" &&
        now > deadline
        ) {
        violationType = "provider";
        }

        // ==========================
        // NO VIOLATION
        // ==========================
        if (!violationType) return;

        if (now <= deadline) {
        return; // ⛔ Do nothing if deadline not passed
        }
        // ==========================
        // STEP 2: INTERVAL CALCULATION (CORRECTED)
        // ==========================
        const totalDelayDays = (now - deadline) / (1000 * 60 * 60 * 24);

        // total intervals that SHOULD exist
        const totalIntervals = Math.max(
        0,
        Math.floor(totalDelayDays / 2)
        );
        console.log("Delay days:", totalDelayDays);
        console.log("Intervals:", totalIntervals);
        // intervals already applied
        const appliedIntervals = agr.penaltyAccumulatedIntervals || 0;

        // new intervals to apply
        const newIntervals = totalIntervals - appliedIntervals;

        if (newIntervals <= 0) return;

        // ==========================
        // STEP 3: COMPOUND PENALTY CALCULATION
        // ==========================
        const baseAmount = agr.amount;

        const penaltyValue = Number(agr.penaltyPercent || agr.penalty || 0);
        const rate = Number(penaltyValue || 0) / 100;

        if (!rate || rate <= 0) {
        return; // no penalty defined → skip
        }
        console.log("Penalty rate:", rate);

        let newAmount = baseAmount;
        let penaltyAmount = 0;

        // ==========================
        // PROVIDER FAILURE → DEDUCT
        // ==========================
        if (violationType === "provider") {

        const finalFactor = Math.pow(1 - rate, totalIntervals);
        newAmount = baseAmount * finalFactor;

        penaltyAmount = baseAmount - newAmount; // deducted amount
        }

        // ==========================
        // CLIENT FAILURE → ADD
        // ==========================
        if (violationType === "client") {

        const finalFactor = Math.pow(1 + rate, totalIntervals);
        newAmount = baseAmount * finalFactor;

        penaltyAmount = newAmount - baseAmount; // extra charged
        }

        if (isNaN(newAmount) || isNaN(penaltyAmount)) {
        console.log("Skipping invalid penalty calculation");
        return;
        }
        // ==========================
        // STEP 4: UPDATE AGREEMENT
        // ==========================
        agr.penaltyAccumulated = penaltyAmount;
        agr.penaltyAccumulatedIntervals = totalIntervals;
        agr.lastPenaltyAppliedAt = now;
        agr.violationType = violationType;
        agr.adjustedAmount = Math.round(newAmount);

        await agr.save();

        // ==========================
        // STEP 5: UPDATE PAYMENT
        // ==========================

        // ==========================
        // STEP 6: LOG EVENT
        // ==========================
        await logEvent({
            user: {
                id: null,
                email: violationType === "provider"
                    ? agr.providerEmail
                    : agr.clientEmail,
                role: "provider",
            },
            action: "PENALTY_APPLIED",
            agreementId: agr._id,
        });

        // ==========================
        // REAL-TIME NOTIFICATION
        // ==========================
        const lastEmail = agr.lastPenaltyEmailAt || 0;
        const diff = (now - lastEmail) / (1000 * 60 * 60 * 24);

        if (diff < 2) return; // ⛔ skip if not 2 days yet
        await notificationService.notify("penalty_applied", agr, {
        penaltyAmount,
        violationType,
        newAmount
        });
        
        agr.lastPenaltyEmailAt = now;
        await agr.save();
    } catch (err) {
        console.error("Penalty Service Error:", err.message);
    }
};