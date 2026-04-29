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

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "shohojtrust_disputes",
        resource_type: "auto", // Allows raw files like pdf, docx as well as images
        public_id: (req, file) => Date.now() + "-" + file.originalname.split(".")[0],
    },
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
