const Dispute = require("../models/Dispute");
const Agreement = require("../models/Agreement");
const User = require("../models/User");

// @desc    Create a new dispute
// @route   POST /api/disputes
// @access  Private (Client or Provider)
const createDispute = async (req, res) => {
    try {
        const { agreementId, issueType, description } = req.body;
        
        // Extract file paths from multer
        let evidenceFiles = [];
        if (req.files && req.files.length > 0) {
            evidenceFiles = req.files.map(file => `/uploads/${file.filename}`);
        }

        const dispute = new Dispute({
            agreementId,
            userEmail: req.user.email,
            issueType,
            description,
            evidenceFiles,
            status: "submitted"
        });

        await dispute.save();

        res.status(201).json({
            success: true,
            message: "Dispute created successfully",
            data: dispute
        });
    } catch (error) {
        console.error("Error creating dispute:", error);
        res.status(500).json({ success: false, message: "Server error creating dispute" });
    }
};

// @desc    Get all disputes
// @route   GET /api/disputes
// @access  Private (Admin)
const getAllDisputes = async (req, res) => {
    try {
        const disputes = await Dispute.find()
            .populate("agreementId", "title clientEmail providerEmail status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: disputes
        });
    } catch (error) {
        console.error("Error fetching disputes:", error);
        res.status(500).json({ success: false, message: "Server error fetching disputes" });
    }
};

// @desc    Get single dispute
// @route   GET /api/disputes/:id
// @access  Private (Admin)
const getDisputeById = async (req, res) => {
    try {
        const dispute = await Dispute.findById(req.params.id)
            .populate("agreementId");

        if (!dispute) {
            return res.status(404).json({ success: false, message: "Dispute not found" });
        }

        res.status(200).json({
            success: true,
            data: dispute
        });
    } catch (error) {
        console.error("Error fetching dispute:", error);
        res.status(500).json({ success: false, message: "Server error fetching dispute" });
    }
};

// @desc    Resolve dispute (remove from DB)
// @route   PATCH /api/disputes/:id/resolve
// @access  Private (Admin)
const resolveDispute = async (req, res) => {
    try {
        const dispute = await Dispute.findById(req.params.id);
        
        if (!dispute) {
            return res.status(404).json({ success: false, message: "Dispute not found" });
        }

        // The user specified: after clicking resolve button it will remove the dispute from database
        await Dispute.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Dispute resolved and removed successfully"
        });
    } catch (error) {
        console.error("Error resolving dispute:", error);
        res.status(500).json({ success: false, message: "Server error resolving dispute" });
    }
};

// @desc    Cancel agreement & apply penalty
// @route   PATCH /api/disputes/:id/cancel-agreement
// @access  Private (Admin)
const cancelAgreementAndPenalize = async (req, res) => {
    try {
        const dispute = await Dispute.findById(req.params.id);
        
        if (!dispute) {
            return res.status(404).json({ success: false, message: "Dispute not found" });
        }

        const agreement = await Agreement.findById(dispute.agreementId);

        if (!agreement) {
            return res.status(404).json({ success: false, message: "Associated agreement not found" });
        }

        // Update agreement status
        agreement.status = "cancelled";
        await agreement.save();

        // Apply penalty to the provider or client?
        // Typically, the person who breached gets the penalty.
        // Let's deduce who is penalized. Let's penalize the provider for now as a default rule
        // or apply the penalty to the user who DID NOT raise the dispute.
        let penalizedEmail = agreement.providerEmail;
        if (dispute.userEmail === agreement.providerEmail) {
            penalizedEmail = agreement.clientEmail;
        }

        // Apply -5 penalty
        const userToPenalize = await User.findOne({ email: penalizedEmail });
        if (userToPenalize) {
            userToPenalize.trustScore = (userToPenalize.trustScore || 10) - 5;
            await userToPenalize.save();
        }

        // Remove the dispute
        await Dispute.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Agreement cancelled, penalty applied, and dispute removed"
        });
    } catch (error) {
        console.error("Error cancelling agreement:", error);
        res.status(500).json({ success: false, message: "Server error cancelling agreement" });
    }
};

module.exports = {
    createDispute,
    getAllDisputes,
    getDisputeById,
    resolveDispute,
    cancelAgreementAndPenalize
};
