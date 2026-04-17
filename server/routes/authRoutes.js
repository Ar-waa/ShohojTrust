const express = require("express");
const router = express.Router();
const { authUser } = require("../controllers/authController");

// This matches POST /api/auth
router.post("/", authUser);

module.exports = router;