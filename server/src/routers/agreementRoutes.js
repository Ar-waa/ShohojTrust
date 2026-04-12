const router = require("express").Router();
const protect = require("../middleware/authMiddleware");

const {
    createAgreement,
    getAgreements
    } = require("../controllers/agreementController");

router.post("/", protect, createAgreement);
router.get("/", protect, getAgreements);

module.exports = router;
