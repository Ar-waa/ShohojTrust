const { sendEmail } = require("./emailService");
const { io } = require("../server");

exports.notify = async (type, agr, extra = {}) => {
    try {
        if (!agr) return;

        const clientEmail = agr.clientEmail;
        const providerEmail = agr.providerEmail;
        const title = agr.title || "Agreement";
        const deadline = agr.date || "";


        // ==========================
        // DEADLINE APPROACHING
        // ==========================
        if (type === "deadline_approaching") {
        const subject = "⏳ Deadline Approaching";

        const html = `
            <h3>Deadline Approaching</h3>
            <p><strong>${title}</strong></p>
            <p>Deadline: ${new Date(deadline).toLocaleDateString()}</p>
            <p>Please take action before the deadline.</p>
        `;

        if (clientEmail) {
            await sendEmail({ to: clientEmail, subject, htmlContent: html });

            // ✅ SOCKET EMIT
            io.to(clientEmail).emit("deadline_approaching", { title });
        }

        if (providerEmail) {
            await sendEmail({ to: providerEmail, subject, htmlContent: html });

            // ✅ SOCKET EMIT
            io.to(providerEmail).emit("deadline_approaching", { title });
        }
        }

        // ==========================
        // DEADLINE MISSED
        // ==========================
        if (type === "deadline_missed") {
        const subject = "⚠️ Deadline Missed";

        const html = `
            <h3>Deadline Missed</h3>
            <p><strong>${title}</strong></p>
            <p>The deadline has passed.</p>
            <p>Penalty may be applied.</p>
        `;

        if (clientEmail) {
            await sendEmail({ to: clientEmail, subject, htmlContent: html });

            // ✅ SOCKET EMIT
            io.to(clientEmail).emit("deadline_missed", { title });
        }

        if (providerEmail) {
            await sendEmail({ to: providerEmail, subject, htmlContent: html });

            // ✅ SOCKET EMIT
            io.to(providerEmail).emit("deadline_missed", { title });
        }
        }

        // ==========================
        // PENALTY APPLIED
        // ==========================
        if (type === "penalty_applied") {
        const penaltyAmount = Number(extra.penaltyAmount || 0);
        const violationType = extra.violationType || "unknown";
        const newAmount = Number(extra.newAmount || 0); // 🔴 FIX missing variable

        const subject = "💸 Penalty Applied";

        const html = `
            <h3>Penalty Applied</h3>
            <p><strong>${title}</strong></p>
            <p>Penalty Amount: ৳${penaltyAmount.toFixed(2)}</p>
            <p>New Amount: ৳${newAmount.toFixed(2)}</p>
            <p>Reason: ${violationType} delay</p>
        `;

        // send ONLY to responsible party
        if (violationType === "provider" && providerEmail) {
            await sendEmail({ to: providerEmail, subject, htmlContent: html });

            // ✅ SOCKET EMIT
            io.to(providerEmail).emit("penalty_applied", {
                title,
                penaltyAmount
            });
        }

        if (violationType === "client" && clientEmail) {
            await sendEmail({ to: clientEmail, subject, htmlContent: html });

            // ✅ SOCKET EMIT
            io.to(clientEmail).emit("penalty_applied", {
                title,
                penaltyAmount
            });
        }
        }

    } catch (err) {
        console.error("NOTIFICATION ERROR:", err.message);
    }
};