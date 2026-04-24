const User = require("../models/User");
const TrustConfig = require("../models/TrustConfig");

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
  getAllTrustScores,
  updateWeights
};