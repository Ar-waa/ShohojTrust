const mongoose = require("mongoose");

const trustConfigSchema = new mongoose.Schema({
  positiveWeight: { type: Number, default: 10 },
  neutralWeight: { type: Number, default: 2 },
  negativeWeight: { type: Number, default: -10 },
  disputeWeight: { type: Number, default: -15 }
});

module.exports = mongoose.model("TrustConfig", trustConfigSchema);