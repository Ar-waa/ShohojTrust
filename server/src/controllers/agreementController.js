const Agreement = require("../models/Agreement");

// CREATE AGREEMENT
exports.createAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.create({
            providerEmail: req.body.providerEmail,
            clientEmail: req.body.clientEmail,
            userId: req.user.id,
            title: req.body.title,
            category: req.body.category,
            terms: req.body.terms,
            date: req.body.date,
            amount: req.body.amount,
            penalty: req.body.penalty
        });

        res.json(agreement);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

    // GET AGREEMENTS
    exports.getAgreements = async (req, res) => {
    try {
        const agreements = await Agreement.find({ userId: req.user.id });
        res.json(agreements);
    } catch (err) {
        res.status(500).json(err.message);
    }
};
