const User = require("../models/User");
const TrustConfig = require("../models/TrustConfig");
const Agreement = require("../models/Agreement");
const Dispute = require("../models/Dispute");

// ==========================
// CLASSIFY RELIABILITY TIER
// ==========================
const classifyReliabilityTier = (score) => {
  if (score >= 75) return { tier: "High", color: "#1f8f3a", description: "Excellent reliability" };
  if (score >= 50) return { tier: "Moderate", color: "#f59e0b", description: "Good reliability" };
  return { tier: "Low", color: "#ef4444", description: "Needs improvement" };
};

// ==========================
// GET OWN TRUST SCORE
// ==========================
const getTrustScore = async (req, res) => {
  try {
    if (req.user.role === "admin" || req.user.id === "static-admin") {
      return res.json({
        trustScore: 100, // or 'N/A'
        email: req.user.email || "admin@gmail.com",
        role: "admin"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      trustScore: user.trustScore || 0,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ==========================
// GET DETAILED TRUST SCORE BREAKDOWN
// ==========================
const getTrustScoreBreakdown = async (req, res) => {
  try {
    console.log("🔍 getTrustScoreBreakdown called");
    console.log("📌 User:", req.user);

    if (req.user.role === "admin" || req.user.id === "static-admin") {
      return res.json({
        trustScore: 100,
        email: req.user.email || "admin@gmail.com",
        role: "admin",
        reliabilityTier: { tier: "Admin", color: "#3b82f6", description: "Administrative account" },
        breakdown: {
          completedAgreements: { score: 0, context: "administrative" },
          paymentHistory: { score: 0, context: "administrative" },
          disputeRecord: { score: 0, context: "administrative" },
          responseTime: { score: 0, context: "administrative" }
        }
      });
    }

    const user = await User.findById(req.user.id);
    console.log("👤 User found:", user?.email);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const userEmail = user.email;
    console.log("🔗 Finding agreements for:", userEmail);

    // Fetch agreements for this user
    const agreements = await Agreement.find({
      $or: [{ providerEmail: userEmail }, { clientEmail: userEmail }]
    });
    console.log("📋 Agreements found:", agreements.length);

    // Fetch disputes involving this user
    const disputes = await Dispute.find({ userEmail });
    console.log("⚠️ Disputes found:", disputes.length);

    // Calculate context-based scores
    const completedCount = agreements.filter(a => a.status === "completed" || a.status === "paid").length;
    const totalAgreements = agreements.length || 1;
    const completionRate = Math.round((completedCount / totalAgreements) * 30);

    const paidCount = agreements.filter(a => a.status === "paid").length;
    const paymentScore = Math.round((paidCount / totalAgreements) * 25);

    const disputeCount = disputes.length;
    const disputeScore = Math.max(0, 25 - (disputeCount * 5));

    const avgResponseTime = 20; // placeholder - could calculate from events
    const responseScore = 20;

    const breakdown = {
      completedAgreements: { 
        score: Math.min(completionRate, 30), 
        context: "agreement_completion",
        count: completedCount
      },
      paymentHistory: { 
        score: Math.min(paymentScore, 25), 
        context: "payment_reliability",
        count: paidCount
      },
      disputeRecord: { 
        score: Math.max(0, disputeScore), 
        context: "dispute_history",
        count: disputeCount
      },
      responseTime: { 
        score: responseScore, 
        context: "response_time",
        avgHours: avgResponseTime
      }
    };

    const totalScore = Object.values(breakdown).reduce((sum, item) => sum + item.score, 0);

    res.json({
      trustScore: user.trustScore || totalScore,
      email: user.email,
      role: user.role,
      reliabilityTier: classifyReliabilityTier(user.trustScore || totalScore),
      breakdown,
      stats: {
        totalAgreements,
        completedAgreements: completedCount,
        paidAgreements: paidCount,
        disputes: disputeCount
      }
    });

  } catch (err) {
    console.error("❌ Error in getTrustScoreBreakdown:", err);
    res.status(500).json({ msg: err.message });
  }
};
// ==========================
// GET ALL USERS TRUST SCORES
// ==========================
const getAllTrustScores = async (req, res) => {
  try {
    const users = await User.find().select("email role trustScore");

    res.json(users);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ==========================
// UPDATE TRUST WEIGHTS (ADMIN)
// ==========================
const updateWeights = async (req, res) => {
  try {
    let config = await TrustConfig.findOne();

    if (!config) {
      config = await TrustConfig.create(req.body);
    } else {
      Object.assign(config, req.body);
      await config.save();
    }

    res.json({
      msg: "Trust weights updated successfully",
      config
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  getTrustScore,
  getTrustScoreBreakdown,
  getAllTrustScores,
  updateWeights
};