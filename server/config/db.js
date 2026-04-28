const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error("Missing MongoDB URI in environment variables");
        process.exit(1);
    }

    try {
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(uri);
        console.log(`MongoDB connected to Cloud Database`);
    } catch (err) {
        console.error("MongoDB connection failed:");
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;