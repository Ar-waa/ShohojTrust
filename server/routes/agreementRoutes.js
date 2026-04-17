const express = require("express");
const router = express.Router();

const {
    createAgreement,
    updateStatus,
    previewAgreement,
    getActiveAgreements,
    getAgreementEvents,
} = require("../controllers/agreementController");

// ==========================
// PREVIEW AGREEMENT (TEMP SAVE)
// MUST COME BEFORE "/:id"
// ==========================
router.post("/preview", previewAgreement);

// ==========================
// CREATE AGREEMENT (FINAL SAVE)
// ==========================
router.post("/", createAgreement);

// ==========================
// GET ACTIVE AGREEMENTS
// ==========================
router.get("/active", getActiveAgreements);

// ==========================
// GET TIMELINE / EVENTS
// ==========================
router.get("/:id/events", getAgreementEvents);

// ==========================
// ACCEPT / REJECT AGREEMENT
// ==========================
router.patch("/:id/status", updateStatus);

module.exports = router;