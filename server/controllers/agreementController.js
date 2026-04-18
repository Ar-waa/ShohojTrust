const Agreement = require("../models/Agreement");
const AgreementAction = require("../models/AgreementAction");

// ==========================
// CREATE FINAL AGREEMENT
// ==========================
const createAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.create(req.body);

    res.status(201).json({
      msg: "Agreement created successfully",
      agreement,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// PREVIEW AGREEMENT
// ==========================
const previewAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.create(req.body);

    res.status(201).json(agreement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// SAVE DRAFT (SEND TO CLIENT)
// ==========================
const saveDraft = async (req, res) => {
  try {
    const providerEmail = String(req.body.providerEmail || "").trim().toLowerCase();
    const clientEmail = String(req.body.clientEmail || "").trim().toLowerCase();

    if (!providerEmail || !clientEmail) {
      return res.status(400).json({
        msg: "Provider and client emails are required",
      });
    }

    const agreement = await Agreement.create({
      ...req.body,
      providerEmail,
      clientEmail,
      status: "pending",
    });

    res.status(201).json({
      msg: "Draft sent to client successfully",
      agreement,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// ACCEPT / REJECT AGREEMENT
// ==========================
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const normalizedStatus = String(status).toLowerCase();

    if (!["accepted", "rejected"].includes(normalizedStatus)) {
      return res.status(400).json({
        error: "Status must be accepted or rejected",
      });
    }

    const agreement = await Agreement.findById(id);

    if (!agreement) {
      return res.status(404).json({ error: "Agreement not found" });
    }

    // ❌ prevent double action
    if (agreement.status !== "pending") {
      return res.status(400).json({
        error: "Agreement already finalized",
      });
    }

    // ==========================
    // UPDATE STATUS
    // ==========================
    agreement.status = normalizedStatus;
    await agreement.save();

    // ==========================
    // LOG ACTION (TIMELINE)
    // ==========================
    const action = await AgreementAction.create({
      agreementId: id,
      status: normalizedStatus,
      clientEmail: agreement.clientEmail,
      providerEmail: agreement.providerEmail,
    });

    res.json({
      msg: "Status updated successfully",
      agreement,
      action,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// ACTIVE AGREEMENTS LIST
// ==========================
const getActiveAgreements = async (req, res) => {
  try {
    const { userEmail } = req.query;
    const requesterRole = req.user?.role;

    const agreements = await Agreement.find({
      status: { $in: ["pending", "accepted", "rejected"] },
    }).sort({ updatedAt: -1 });

    if (requesterRole === "admin") {
      return res.json(agreements);
    }

    const normalized = String(userEmail || "").trim().toLowerCase();

    const filtered = normalized
      ? agreements.filter((a) =>
          [a.clientEmail, a.providerEmail]
            .map((e) => String(e || "").trim().toLowerCase())
            .includes(normalized)
        )
      : agreements;

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// TIMELINE
// ==========================
const getAgreementEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.query;
    const requesterRole = req.user?.role;

    const agreement = await Agreement.findById(id).lean();
    if (!agreement) {
      return res.status(404).json({ error: "Agreement not found" });
    }

    const normalizedUserEmail = String(userEmail || "").trim().toLowerCase();
    const isParticipant = [agreement.clientEmail, agreement.providerEmail]
      .map((e) => String(e || "").trim().toLowerCase())
      .includes(normalizedUserEmail);

    if (requesterRole !== "admin" && normalizedUserEmail && !isParticipant) {
      return res.status(403).json({ error: "You are not authorized to view this agreement timeline" });
    }

    const actions = await AgreementAction.find({ agreementId: id })
      .sort({ createdAt: 1 })
      .lean();

    const timeline = [
      {
        key: "created",
        title: "Agreement Created",
        description: `Provider ${agreement.providerEmail} sent this agreement to client ${agreement.clientEmail}.`,
        icon: "send",
        iconColor: "blue",
        badge: "SENT",
        badgeType: "paid",
        time: agreement.createdAt,
      },
      ...actions.map((a) => ({
        key: a._id,
        title: a.status === "accepted" ? "Agreement Accepted" : "Agreement Rejected",
        description:
          a.status === "accepted"
            ? `Client ${agreement.clientEmail} accepted the agreement.`
            : `Client ${agreement.clientEmail} rejected the agreement.`,
        icon: a.status === "accepted" ? "check" : "alert",
        iconColor: a.status === "accepted" ? "green" : "orange",
        badge: a.status === "accepted" ? "SIGNED" : "REJECTED",
        badgeType: a.status === "accepted" ? "signed" : "reminder",
        time: a.createdAt,
      })),
    ].sort((a, b) => new Date(a.time) - new Date(b.time));

    res.json({
      agreementId: agreement._id,
      title: agreement.title,
      clientEmail: agreement.clientEmail,
      providerEmail: agreement.providerEmail,
      status: agreement.status,
      timeline,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// EXPORT (FIXED - SINGLE EXPORT)
// ==========================
module.exports = {
  createAgreement,
  previewAgreement,
  saveDraft,
  updateStatus,
  getActiveAgreements,
  getAgreementEvents,
};