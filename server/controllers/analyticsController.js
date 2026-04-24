const User = require("../models/User");
const Agreement = require("../models/Agreement");
const Event = require("../models/Event");

// @desc    Get list of all users
// @route   GET /api/analytics/users
// @access  Private (Admin or appropriate roles, we'll let all authenticated for now)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get analytics for a specific user
// @route   GET /api/analytics/:userId
// @access  Private
exports.getUserAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const email = user.email;

        // Fetch all agreements for this user
        const agreements = await Agreement.find({
            $or: [{ providerEmail: email }, { clientEmail: email }]
        });

        const totalAgreements = agreements.length;
        
        let completedCount = 0;
        let cancelledCount = 0;
        let positiveCount = 0;
        let negativeCount = 0;
        let totalResponseTimeMs = 0;
        let responseTimeCount = 0;

        const cancellationTrends = {};

        agreements.forEach(agg => {
            // Completion & Cancellation
            if (agg.status === "completed") {
                completedCount++;
            } else if (agg.status === "cancelled") {
                cancelledCount++;
                
                // Group cancellations by month
                const monthYear = new Date(agg.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
                cancellationTrends[monthYear] = (cancellationTrends[monthYear] || 0) + 1;
            }

            // Behavior Classification
            // Positive = completed, accepted, paid
            if (["completed", "accepted", "paid"].includes(agg.status)) {
                positiveCount++;
            }
            // Negative = cancelled, rejected
            if (["cancelled", "rejected"].includes(agg.status)) {
                negativeCount++;
            }

            // Response Time Tracking using createdAt and updatedAt
            // We assume if status is not 'pending', an action was taken
            if (agg.status !== "pending" && agg.createdAt && agg.updatedAt) {
                const createdTime = new Date(agg.createdAt).getTime();
                const updatedTime = new Date(agg.updatedAt).getTime();
                const diff = updatedTime - createdTime;

                // Ensure it's a valid time (not same timestamp from seed data)
                if (diff > 0) {
                    totalResponseTimeMs += diff;
                    responseTimeCount++;
                }
            }
        });

        // Calculations
        const completionRate = totalAgreements > 0 ? ((completedCount / totalAgreements) * 100).toFixed(2) : 0;
        const cancellationRate = totalAgreements > 0 ? ((cancelledCount / totalAgreements) * 100).toFixed(2) : 0;
        
        const totalActions = positiveCount + negativeCount;
        const positiveBehaviorPercentage = totalActions > 0 ? ((positiveCount / totalActions) * 100).toFixed(2) : 0;

        let avgResponseTimeText = "N/A";
        if (responseTimeCount > 0) {
            const avgMs = totalResponseTimeMs / responseTimeCount;
            const avgMins = Math.round(avgMs / 60000);
            if (avgMins < 60) {
                avgResponseTimeText = `${avgMins} mins`;
            } else {
                const avgHours = (avgMins / 60).toFixed(1);
                avgResponseTimeText = `${avgHours} hours`;
            }
        }

        // Format chart data
        const cancellationChartData = Object.keys(cancellationTrends).map(key => ({
            name: key,
            cancellations: cancellationTrends[key]
        }));

        const behaviorData = [
            { name: "Positive", value: positiveCount },
            { name: "Negative", value: negativeCount }
        ];

        const completionChartData = [
            { name: "Completed", value: completedCount },
            { name: "Cancelled", value: cancelledCount },
            { name: "Other", value: totalAgreements - completedCount - cancelledCount }
        ];

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    trustScore: user.trustScore,
                    createdAt: user.createdAt
                },
                summary: {
                    totalAgreements,
                    completionRate,
                    cancellationRate,
                    avgResponseTimeText,
                    positiveBehaviorPercentage
                },
                charts: {
                    cancellationTrends: cancellationChartData,
                    behaviorData,
                    completionChartData
                }
            }
        });

    } catch (error) {
        console.error("Error calculating user analytics:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
