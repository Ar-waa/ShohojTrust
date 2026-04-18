const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const authUser = async (req, res) => {
    try {
        const { email, password, role, isSignup } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (!normalizedEmail || !password) {
            return res.status(400).json({ msg: "Email and password are required" });
        }

        // ==========================
        // SIGNUP
        // ==========================
        if (isSignup) {
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
                return res.status(400).json({ msg: "User already exists" });
            }

            const newUser = new User({
                email: normalizedEmail,
                password,
                role: role || "client" // ✅ fallback safety
            });

            await newUser.save();

            const token = jwt.sign(
                { id: newUser._id, role: newUser.role, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            // ✅ AUTO LOGIN AFTER SIGNUP
            return res.status(201).json({
                token,
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    role: newUser.role
                },
                msg: "Signup successful"
            });
        }

        // ==========================
        // STATIC ADMIN LOGIN
        // ==========================
        if (normalizedEmail === "admin@gmail.com" && password === "1234") {
            const token = jwt.sign(
                { id: "static-admin", role: "admin" },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.json({
                token,
                user: {
                    id: "static-admin",
                    email: "admin@gmail.com",
                    role: "admin"
                },
                msg: "Login successful"
            });
        }

        // ==========================
        // LOGIN
        // ==========================
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email},
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            msg: "Login successful"
        });

    } catch (err) {
        console.error("AUTH ERROR:", err);

        if (err && err.code === 11000) {
            return res.status(400).json({ msg: "User already exists" });
        }

        if (err && err.name === "ValidationError") {
            return res.status(400).json({ msg: err.message });
        }

        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

module.exports = { authUser };