const express = require("express");
const router = express.Router();

const {
  getTrustScore,
  getAllTrustScores,   // ✅ ADD THIS
  updateWeights
} = require("../controllers/trustController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ==========================
// GET MY TRUST SCORE
// ==========================
router.get("/trust-score", protect, getTrustScore);

// ==========================
// GET ALL USERS TRUST SCORES ⭐ NEW
// ==========================
router.get("/all", protect, getAllTrustScores);

// ==========================
// ADMIN UPDATE WEIGHTS
// ==========================
router.put("/trust-weights", protect, authorize("admin"), updateWeights);

module.exports = router;