const express = require("express");
const router = express.Router();

const {
    createAgreement,
    updateStatus,
    previewAgreement,
    getActiveAgreements,
    getAgreementEvents,
} = require("../controllers/agreementController");

// CREATE agreement (final save)
router.post("/", createAgreement);

// PREVIEW agreement
router.post("/preview", previewAgreement);

// ACCEPT / REJECT STATUS + STORE EMAILS + TIMESTAMP
router.put("/:id/status", updateStatus);

// GET ACTIVE AGREEMENTS (LATEST ACCEPTED/REJECTED STATUS)
router.get("/active", getActiveAgreements);

// GET AGREEMENT ACTIVITY TIMELINE (FOR SINGLE AGREEMENT)
router.get("/:id/events", getAgreementEvents);

module.exports = router;