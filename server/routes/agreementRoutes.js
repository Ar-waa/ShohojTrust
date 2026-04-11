const express = require("express");
const router = express.Router();

const {
    createAgreement,
    updateStatus,
    previewAgreement
} = require("../controllers/agreementController");

// CREATE agreement (final save)
router.post("/", createAgreement);

// PREVIEW agreement
router.post("/preview", previewAgreement);

// ACCEPT / REJECT STATUS + STORE EMAILS + TIMESTAMP
router.put("/:id/status", updateStatus);

module.exports = router;