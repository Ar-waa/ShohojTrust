const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { protect, authorize } = require("../middleware/authMiddleware");
const {
    createDispute,
    getAllDisputes,
    getDisputeById,
    resolveDispute,
    cancelAgreementAndPenalize
} = require("../controllers/disputeController");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg", 
            "image/png", 
            "image/jpg",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPG, PNG, PDF, and DOC/DOCX are allowed."));
        }
    }
});

// Routes
// POST /api/disputes - Create dispute (Client/Provider)
router.post("/", protect, authorize("client", "provider"), upload.array("evidenceFiles", 5), createDispute);

// GET /api/disputes - Get all disputes (Admin)
router.get("/", protect, authorize("admin"), getAllDisputes);

// GET /api/disputes/:id - Get dispute details (Admin)
// If you want clients/providers to see it, add those roles to authorize.
router.get("/:id", protect, authorize("admin", "client", "provider"), getDisputeById);

// PATCH /api/disputes/:id/resolve - Admin resolve
router.patch("/:id/resolve", protect, authorize("admin"), resolveDispute);

// PATCH /api/disputes/:id/cancel-agreement - Admin cancel & penalize
router.patch("/:id/cancel-agreement", protect, authorize("admin"), cancelAgreementAndPenalize);

module.exports = router;
