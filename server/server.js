const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/agreements", require("./routes/agreementRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/trust", require("./routes/trustRoutes"));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect to MongoDB.", err.message);
        process.exit(1);
    }
};

startServer();

//
// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");

// const connectDB = require("./config/db");

// dotenv.config();
// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/api/auth", require("./routers/authRoutes"));
// app.use("/api/agreements", require("./routers/agreementRoutes"));

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(Server running at http://localhost:${PORT});
// });