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

    const action = await AgreementAction.create({
      agreementId: id,
      status,
      clientEmail,
      providerEmail,
    });

    res.json({
      message: "Status stored successfully",
      action,
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
};