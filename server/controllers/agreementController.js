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
    const agreement = await Agreement.create({
      ...req.body,
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

    const agreements = await Agreement.find({
      status: { $in: ["pending", "accepted", "rejected"] },
    }).sort({ updatedAt: -1 });

    const normalized = String(userEmail || "").toLowerCase();

    const filtered = normalized
      ? agreements.filter((a) =>
          [a.clientEmail, a.providerEmail]
            .map((e) => String(e).toLowerCase())
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

    const agreement = await Agreement.findById(id).lean();
    if (!agreement) {
      return res.status(404).json({ error: "Agreement not found" });
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