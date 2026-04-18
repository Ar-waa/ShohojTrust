const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const Event = require("../models/Event");
const { getEvent, overrideEvent, getAgreementAnalytics } = require("../controllers/eventController");

router.get("/:agreementId", protect, getEvent);

router.put("/override/:eventId", protect, authorize("admin"), overrideEvent);

router.get("/analytics/:agreementId",protect, getAgreementAnalytics);


module.exports = router;
