const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");


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

app.get("/test", (req, res) => {
  res.send("Server is working");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        
        // Prevent process from exiting
        server.on('error', (err) => {
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