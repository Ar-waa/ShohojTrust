const express = require("express");
const router = express.Router();

const {
  getTrustScore,
  updateWeights
} = require("../controllers/trustController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ==========================
// USER TRUST SCORE
// ==========================
router.get("/trust-score", protect, getTrustScore);

// ==========================
// ADMIN TRUST WEIGHTS UPDATE
// ==========================
router.put("/trust-weights", protect, authorize("admin"), updateWeights);

module.exports = router;