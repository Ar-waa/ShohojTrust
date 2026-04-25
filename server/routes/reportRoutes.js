const express = require("express");
const router = express.Router();
const {
  getMyReport,
  downloadMyReportPdf
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

router.get("/my-report", protect, getMyReport);
router.get("/my-report/pdf", protect, downloadMyReportPdf);

module.exports = router;
