const express = require("express");
const router = express.Router();

const {
  getTrustScore,
  getTrustScoreBreakdown,
  getAllTrustScores,
  updateWeights
} = require("../controllers/trustController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ==========================
// GET MY TRUST SCORE 
// ==========================

console.log("✅ TRUST ROUTES LOADED");
router.get("/trust-score", protect, getTrustScore);

// ==========================
// GET TRUST SCORE BREAKDOWN
// ==========================
router.get("/trust-score-breakdown", protect, getTrustScoreBreakdown);

// ==========================
// GET ALL USERS TRUST SCORES
// ==========================
router.get("/all",protect,  getAllTrustScores);

// ==========================
// ADMIN UPDATE WEIGHTS
// ==========================
router.put("/trust-weights", protect, authorize("admin"), updateWeights);

module.exports = router;