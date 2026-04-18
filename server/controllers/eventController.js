const Event = require("../models/Event");
const Agreement = require("../models/Agreement");

const getEvent = async (req, res) => {
        try {
        const events = await Event.find({
        agreementId: req.params.agreementId,
        }).sort({ createdAt: 1 });

        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// ==========================
// ADMIN OVERRIDE EVENT
// ==========================
const overrideEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { category, reason } = req.body;

        // validate category
        const validCategories = ["positive", "neutral", "negative", "dispute"];
        if (!validCategories.includes(category)) {
        return res.status(400).json({ msg: "Invalid category" });
        }

        const event = await Event.findById(eventId);

        if (!event) {
        return res.status(404).json({ msg: "Event not found" });
        }

        event.behaviorCategory = category;
        event.overridden = true;
        event.overrideReason = reason;

        await event.save();

        res.json({
        msg: "Event classification overridden successfully",
        event,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };

// ==========================
// AGREEMENT ANALYTICS
// ==========================
const getAgreementAnalytics = async (req, res) => {
    try {
        const { agreementId } = req.params;
        console.log("agreementId:", req.params.agreementId);

        const agreement = await Agreement.findById(agreementId);

        if (!agreement) {
        return res.status(404).json({ msg: "Agreement not found" });
        }

        const userEmail = req.user.email;
        const role = req.user.role;

        // ==========================
        // AUTH CHECK
        // ==========================
        if (role !== "admin") {
        const isParticipant =
            agreement.clientEmail === userEmail ||
            agreement.providerEmail === userEmail;

        if (!isParticipant) {
            return res.status(403).json({ msg: "Not authorized" });
        }
        }

        // ==========================
        // AGGREGATE EVENTS
        // ==========================
        const stats = await Event.aggregate([
        {
            $match: {
            agreementId: agreement._id,
            },
        },
        {
            $group: {
            _id: "$behaviorCategory",
            count: { $sum: 1 },
            },
        },
        ]);

        // ==========================
        // FORMAT RESPONSE
        // ==========================
        const formatted = {
        positive: 0,
        negative: 0,
        neutral: 0,
        dispute: 0,
        };

        stats.forEach((item) => {
        formatted[item._id] = item.count;
        });

        res.json({
        agreementId: agreement._id,
        title: agreement.title,
        category: agreement.category,
        stats: formatted,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


    module.exports = {
    getEvent, overrideEvent, getAgreementAnalytics,
};
