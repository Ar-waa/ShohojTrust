const Agreement = require("../models/Agreement");
const AgreementAction = require("../models/AgreementAction");

// ==========================
// CREATE FINAL AGREEMENT
// ==========================
const createAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.create(req.body);
    res.status(201).json(agreement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// PREVIEW AGREEMENT
// (temporary save for confirmation page)
// ==========================
const previewAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.create(req.body);
    res.status(201).json(agreement); // MUST return _id for frontend
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// ACCEPT / REJECT (FINAL ACTION)
// ==========================
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const normalizedStatus = String(status || "").toLowerCase();

    if (!["accepted", "rejected"].includes(normalizedStatus)) {
      return res.status(400).json({
        error: "Status must be accepted or rejected",
      });
    }

    const agreement = await Agreement.findById(id);

    if (!agreement) {
      return res.status(404).json({ error: "Agreement not found" });
    }

    // ❌ BLOCK DOUBLE DECISION
    if (agreement.status && agreement.status !== "pending") {
      return res.status(400).json({
        error: "Agreement already finalized",
      });
    }

    // ==========================
    // UPDATE AGREEMENT STATUS
    // ==========================
    agreement.status = normalizedStatus;
    await agreement.save();

    // ==========================
    // STORE ACTION (TIMELINE + AUDIT LOG)
    // ==========================
    const action = await AgreementAction.create({
      agreementId: id,
      status: normalizedStatus,
      clientEmail: agreement.clientEmail,
      providerEmail: agreement.providerEmail,
    });

    res.json({
      message: "Status updated successfully",
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

    const activeAgreements = await Agreement.find({
      status: { $in: ["accepted", "rejected"] },
    }).sort({ updatedAt: -1 });

    const normalized = String(userEmail || "").toLowerCase();

    const filtered = normalized
      ? activeAgreements.filter((a) =>
          [a.clientEmail, a.providerEmail]
            .map((e) => String(e).toLowerCase())
            .includes(normalized)
        )
      : activeAgreements;

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
        email: a.clientEmail,
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

module.exports = {
  createAgreement,
  previewAgreement,
  updateStatus,
  getActiveAgreements,
  getAgreementEvents,
};