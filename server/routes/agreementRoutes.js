const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

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
router.post("/", protect, authorize("provider"), createAgreement);

// ==========================
// GET ACTIVE AGREEMENTS
// ==========================
router.get("/active", protect, authorize("provider"), getActiveAgreements);

// ==========================
// GET TIMELINE / EVENTS
// ==========================
router.get("/:id/events", protect, authorize("provider"), getAgreementEvents);

// ==========================
// ACCEPT / REJECT AGREEMENT
// ==========================
router.patch("/:id/status", updateStatus);

module.exports = router;