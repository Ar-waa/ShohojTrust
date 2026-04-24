const express = require("express");
const router = express.Router();
const { getAllUsers, getUserAnalytics } = require("../controllers/analyticsController");

// All routes here should be protected ideally. For now we just route them.
// GET /api/analytics/users
router.get("/users", getAllUsers);

// GET /api/analytics/:userId
router.get("/:userId", getUserAnalytics);

module.exports = router;
