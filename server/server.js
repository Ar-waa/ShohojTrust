const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { startDeadlineJob } = require("./jobs/deadlineCron");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
console.log("PDFSHIFT KEY:", process.env.PDFSHIFT_API_KEY); // 👈 ADD HERE
const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/agreements", require("./routes/agreementRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/trust", require("./routes/trustRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/pdf", require("./routes/pdfRoutes"));
app.use("/api/disputes", require("./routes/disputeRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/test", (req, res) => {
    res.send("Server is working");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;

let io; 

const startServer = async () => {
    try {
        await connectDB();
        const { sendEmail } = require("./services/emailService");

        // await sendEmail({
        // to: "ahsanarwa@gmail.com",
        // subject: "Startup Test",
        // htmlContent: "<h1>Server email working</h1>"
        // });

        const server = http.createServer(app);

        // ==========================
        // SOCKET.IO INIT (CORRECT)
        // ==========================
        io = new Server(server, {
            cors: {
                origin: "http://localhost:5173",
            },
        });

        // ==========================
        // SOCKET CONNECTION HANDLER
        // ==========================
        io.on("connection", (socket) => {
            console.log("Client connected:", socket.id);

            socket.on("join", (userEmail) => {
                if (userEmail) {
                    socket.join(userEmail);
                    console.log(`Socket ${socket.id} joined room ${userEmail}`);
                }
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });

        // ✅ EXPORT IO HERE (IMPORTANT)
        module.exports.io = io;

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);

            // start cron AFTER server ready
            startDeadlineJob();
        });

        server.on("error", (err) => {
            console.error("Server error:", err.message);
        });

    } catch (err) {
        console.error("Failed to connect to MongoDB.", err.message);
        process.exit(1);
    }
};

startServer();

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// ==========================