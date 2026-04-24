const Agreement = require("../models/Agreement");
const AgreementAction = require("../models/AgreementAction");
const { logEvent } = require("../services/eventService");

// ==========================
// CREATE AGREEMENT
// ==========================
const createAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.create(req.body);

    await logEvent({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
      action: "CREATE_TEMPLATE",
      agreementId: agreement._id,
    });

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
// SAVE DRAFT
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

    await logEvent({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
      action: "SEND_AGREEMENT",
      agreementId: agreement._id,
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
// ACCEPT / REJECT
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

    if (agreement.status !== "pending") {
      return res.status(400).json({
        error: "Agreement already finalized",
      });
    }

    agreement.status = normalizedStatus;
    await agreement.save();

    const action = await AgreementAction.create({
      agreementId: id,
      status: normalizedStatus,
      clientEmail: agreement.clientEmail,
      providerEmail: agreement.providerEmail,
    });

    const actionType =
      normalizedStatus === "accepted"
        ? "CONFIRM_AGREEMENT"
        : "REJECT_AGREEMENT";

    await logEvent({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
      action: actionType,
      agreementId: agreement._id,
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
// ACTIVE AGREEMENTS
// ==========================
const getActiveAgreements = async (req, res) => {
  try {
    const { userEmail } = req.query;
    const requesterRole = req.user?.role;

    const agreements = await Agreement.find({
      status: { $in: ["pending", "accepted", "rejected", "paid", "work_done"] },
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
      return res.status(403).json({
        error: "Not authorized",
      });
    }

    const actions = await AgreementAction.find({ agreementId: id })
      .sort({ createdAt: 1 })
      .lean();

    const timeline = [
      {
        key: "created",
        title: "Agreement Created",
        time: agreement.createdAt,
      },
      ...actions.map((a) => ({
        key: a._id,
        title: a.status === "accepted" ? "Accepted" : "Rejected",
        time: a.createdAt,
      })),
    ].sort((a, b) => new Date(a.time) - new Date(b.time));

    res.json({
      agreementId: agreement._id,
      title: agreement.title,
      status: agreement.status,
      timeline,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// COMPLETE AGREEMENT
// ==========================
const completeAgreement = async (req, res) => {
  try {
    const { id } = req.params;

    const agreement = await Agreement.findById(id);

    if (!agreement) {
      return res.status(404).json({ error: "Agreement not found" });
    }

    if (agreement.status !== "accepted") {
      return res.status(400).json({
        error: "Only accepted agreements can be marked as done",
      });
    }

    agreement.status = "work_done";
    await agreement.save();

    const action = await AgreementAction.create({
      agreementId: id,
      status: "work_done",
      clientEmail: agreement.clientEmail,
      providerEmail: agreement.providerEmail,
    });

    await logEvent({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
      action: "COMPLETE_AGREEMENT",
      agreementId: agreement._id,
    });

    res.json({
      msg: "Agreement marked as done successfully",
      agreement,
      action,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// COMPLETED AGREEMENTS HISTORY
// ==========================
const getCompletedAgreements = async (req, res) => {
  try {
    const { userEmail } = req.query;
    const requesterRole = req.user?.role;

    const agreements = await Agreement.find({
      status: "completed",
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

module.exports = {
  createAgreement,
  previewAgreement,
  saveDraft,
  updateStatus,
  getActiveAgreements,
  getAgreementEvents,
  completeAgreement,
  getCompletedAgreements,
};