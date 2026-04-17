const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const authUser = async (req, res) => {
    try {
        const { email, password, role, isSignup } = req.body;

        // --- SIGNUP LOGIC ---
        if (isSignup) {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ msg: "User already exists" });

            const newUser = new User({ email, password, role });
            await newUser.save();

            const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
            return res.status(201).json({ 
                token, 
                user: { id: newUser._id, email: newUser.email, role: newUser.role },
                msg: "Account created successfully. Now please Login." 
            });
        }

        // --- LOGIN LOGIC ---
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({
            token,
            user: { id: user._id, email: user.email, role: user.role },
            msg: "Logged in successfully"
        });

    } catch (err) {
        console.error("AUTH ERROR:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

module.exports = { authUser };
