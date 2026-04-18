    const contextKeywords = {
    rental: ["rent", "lease", "tenant", "landlord"],
    freelance: ["design", "project", "developer", "client"],
    marketplace: ["buy", "sell", "order", "product"],
    service_booking: ["booking", "appointment", "service"],
    };

    function detectContext(text) {
    const lower = text.toLowerCase();

    for (let key in contextKeywords) {
        if (contextKeywords[key].some(word => lower.includes(word))) {
        return key;
        }
    }
    return "general";
    }

    function classifyBehavior(action) {
    const positive = [
        "CONFIRM_AGREEMENT",
        "MAKE_PAYMENT",
        "FOLLOW_TERMS",
        "MARK_SERVICE_COMPLETED",
    ];

    const negative = [
        "DELAY_PAYMENT",
        "FAIL_PAYMENT",
        "BREAK_TERMS",
        "DELAY_SERVICE",
        "NO_RESPONSE",
        "OVERCHARGE",
    ];

    const dispute = [
        "RAISE_DISPUTE",
        "CANCEL_AGREEMENT",
        "REJECT_AGREEMENT",
        "FAIL_SERVICE",
    ];

    if (positive.includes(action)) return "positive";
    if (negative.includes(action)) return "negative";
    if (dispute.includes(action)) return "dispute";

    return "neutral";
}

module.exports = { detectContext, classifyBehavior };
