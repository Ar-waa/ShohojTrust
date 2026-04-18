const User = require("../models/User");
const TrustConfig = require("../models/TrustConfig");

// ==========================
// GET TRUST SCORE (USER)
// ==========================
const getTrustScore = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      trustScore: user.trustScore || 0
    });

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
  updateWeights
};