const Event = require("../models/Event");
const User = require("../models/User");
const TrustConfig = require("../models/TrustConfig");

const calculateTrustScore = async (userId) => {
  const events = await Event.find({ user: userId });

  const config = await TrustConfig.findOne() || {
    positiveWeight: 2,
    negativeWeight: -2,
    disputeWeight: -5,
  };

  let score = 10; // base score

  events.forEach((event) => {
    if (event.behaviorCategory === "positive") {
      score += config.positiveWeight;
    } else if (event.behaviorCategory === "negative") {
      score += config.negativeWeight;
    } else if (event.behaviorCategory === "dispute") {
      score += config.disputeWeight;
    }
  });

  // Clamp between 0–100
  score = Math.max(0, Math.min(100, score));

  await User.findByIdAndUpdate(userId, { trustScore: score });

  return score;
};

module.exports = { calculateTrustScore };