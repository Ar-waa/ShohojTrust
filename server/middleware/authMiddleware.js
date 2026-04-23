const jwt = require("jsonwebtoken");

// ==========================
// AUTH PROTECT MIDDLEWARE
// ==========================
const protect = (req, res, next) => {
    try {
        let token = req.headers.authorization;

        console.log("AUTH HEADER:", req.headers.authorization);

        if (!token) {
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        // Support: "Bearer token"
        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attach user to request
        req.user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email
        };

        next();

    } catch (err) {
        return res.status(401).json({ msg: "Token is not valid" });
    }
};

// ==========================
// ROLE AUTHORIZATION
// ==========================
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                msg: `Role ${req.user.role} is not authorized`
            });
        }

        next();
    };
};

module.exports = { protect, authorize };