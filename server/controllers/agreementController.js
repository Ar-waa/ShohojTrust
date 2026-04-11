const Agreement = require("../models/Agreement");
const AgreementAction = require("../models/AgreementAction");

// ✅ CREATE FINAL AGREEMENT
const createAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.create(req.body);
    res.json(agreement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ PREVIEW AGREEMENT (SAVE TEMP + RETURN _id)
const previewAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.create(req.body);

    res.json(agreement); // includes _id
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ACCEPT / REJECT (STORE ACTION TABLE)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, clientEmail, providerEmail } = req.body;

    const normalizedStatus = String(status || "").toLowerCase();
    if (!["accepted", "rejected"].includes(normalizedStatus)) {
      return res.status(400).json({ error: "Status must be accepted or rejected" });
    }

    const agreement = await Agreement.findById(id).lean();
    if (!agreement) {
      return res.status(404).json({ error: "Agreement not found" });
    }

    const resolvedClientEmail = clientEmail || agreement.clientEmail;
    const resolvedProviderEmail = providerEmail || agreement.providerEmail;

    if (!resolvedClientEmail || !resolvedProviderEmail) {
      return res.status(400).json({
        error: "Missing client/provider email. Save agreement with both emails first.",
      });
    }

    const action = await AgreementAction.create({
      agreementId: id,
      status: normalizedStatus,
      clientEmail: resolvedClientEmail,
      providerEmail: resolvedProviderEmail,
    });

    res.json({
      message: "Status stored successfully",
      action,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ACTIVE AGREEMENTS (LATEST ACCEPTED/REJECTED ACTION PER AGREEMENT)
const getActiveAgreements = async (req, res) => {
  try {
    const { userEmail } = req.query;

    const activeAgreements = await AgreementAction.aggregate([
      {
        $match: {
          status: { $in: ["accepted", "rejected"] },
        },
      },
      {
        $sort: {
          agreementId: 1,
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$agreementId",
          latestAction: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latestAction" },
      },
      {
        $lookup: {
          from: "agreements",
          localField: "agreementId",
          foreignField: "_id",
          as: "agreement",
        },
      },
      {
        $unwind: {
          path: "$agreement",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: { $ifNull: ["$agreement._id", "$agreementId"] },
          title: { $ifNull: ["$agreement.title", "Untitled Agreement"] },
          clientEmail: { $ifNull: ["$agreement.clientEmail", "$clientEmail"] },
          providerEmail: { $ifNull: ["$agreement.providerEmail", "$providerEmail"] },
          status: "$status",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    const normalizedUserEmail = String(userEmail || "").trim().toLowerCase();
    const filteredAgreements = normalizedUserEmail
      ? activeAgreements.filter((item) => {
          const client = String(item.clientEmail || "").toLowerCase();
          const provider = String(item.providerEmail || "").toLowerCase();
          return client === normalizedUserEmail || provider === normalizedUserEmail;
        })
      : activeAgreements;

    res.json(filteredAgreements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET AGREEMENT ACTIVITY TIMELINE FOR A PARTICULAR USER
const getAgreementEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.query;

    const agreement = await Agreement.findById(id).lean();
    if (!agreement) {
      return res.status(404).json({ error: "Agreement not found" });
    }

    const normalizedUserEmail = String(userEmail || "").trim().toLowerCase();
    const clientEmail = String(agreement.clientEmail || "").toLowerCase();
    const providerEmail = String(agreement.providerEmail || "").toLowerCase();

    if (normalizedUserEmail && normalizedUserEmail !== clientEmail && normalizedUserEmail !== providerEmail) {
      return res.status(403).json({ error: "You are not allowed to view this agreement timeline" });
    }

    const actions = await AgreementAction.find({ agreementId: agreement._id })
      .sort({ createdAt: 1 })
      .lean();

    const events = [
      {
        key: "created",
        title: "Agreement Created",
        description: "You created the agreement.",
        time: agreement.createdAt,
        icon: "file",
        iconColor: "blue",
      },
      {
        key: "sent",
        title: "Sent to Client",
        description: `Agreement sent to ${agreement.clientEmail || "client"}.`,
        time: agreement.updatedAt || agreement.createdAt,
        icon: "send",
        iconColor: "blue",
      },
    ];

    actions.forEach((action) => {
      if (action.status === "accepted") {
        events.push({
          key: `accepted-${action._id}`,
          title: "Signed by Client",
          description: `${action.clientEmail || "Client"} signed the agreement.`,
          time: action.createdAt,
          badge: "SIGNED",
          badgeType: "signed",
          icon: "check",
          iconColor: "green",
        });
      }

      if (action.status === "rejected") {
        events.push({
          key: `rejected-${action._id}`,
          title: "Rejected by Client",
          description: `${action.clientEmail || "Client"} rejected the agreement.`,
          time: action.createdAt,
          badge: "REMINDER",
          badgeType: "reminder",
          icon: "alert",
          iconColor: "orange",
        });
      }
    });

    if (agreement.date) {
      const deadlineDate = new Date(agreement.date);
      if (!Number.isNaN(deadlineDate.getTime())) {
        events.push({
          key: "deadline-reminder",
          title: "Deadline Reminder",
          description: `Upcoming due date: ${deadlineDate.toLocaleDateString()}.`,
          time: deadlineDate,
          badge: "REMINDER",
          badgeType: "reminder",
          icon: "alert",
          iconColor: "orange",
        });
      }
    }

    const timeline = events
      .filter((event) => event.time)
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    res.json({
      agreementId: agreement._id,
      title: agreement.title || "Untitled Agreement",
      clientEmail: agreement.clientEmail,
      providerEmail: agreement.providerEmail,
      timeline,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  createAgreement,
  previewAgreement,
  updateStatus,
  getActiveAgreements,
  getAgreementEvents,
};