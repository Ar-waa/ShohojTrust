const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
    createAgreement,
    updateStatus,
    previewAgreement,
    getActiveAgreements,
    getAgreementEvents,
    saveDraft
} = require("../controllers/agreementController");

// ==========================
// PREVIEW AGREEMENT (TEMP SAVE)
// ==========================
router.post("/preview", previewAgreement);

// ==========================
// CREATE AGREEMENT (FINAL SAVE)
// ONLY PROVIDER
// ==========================
router.post("/", protect, authorize("provider"), createAgreement);

// ==========================
// SAVE DRAFT (PROVIDER → CLIENT)
// ==========================
router.post("/draft", protect, authorize("provider"), saveDraft);

// ==========================
// GET ACTIVE AGREEMENTS
// BOTH CLIENT + PROVIDER
// ==========================
router.get("/active", protect, getActiveAgreements);

// ==========================
// GET TIMELINE / EVENTS
// BOTH CLIENT + PROVIDER
// ==========================
router.get("/:id/events", protect, getAgreementEvents);

// ==========================
// ACCEPT / REJECT AGREEMENT
// ==========================
router.patch("/:id/status", protect, updateStatus);

module.exports = router;