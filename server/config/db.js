const mongoose = require("mongoose");

const connectWithUri = async (uri, label) => {
    if (!uri) {
        throw new Error(`Missing MongoDB URI for ${label}`);
    }

    console.log(`Connecting to MongoDB (${label})...`);
    await mongoose.connect(uri);
    console.log(`MongoDB connected (${label})`);
};

const isSrvLookupError = (err) => {
    return err && (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") && err.syscall === "querySrv";
};

const connectDB = async () => {
    const primaryUri = process.env.MONGO_URI;
    const fallbackUri = process.env.MONGO_URI_FALLBACK || "mongodb://127.0.0.1:27017/ShohojTrust";
    //console.log("Connected DB:", mongoose.connection.name);

    try {
        await connectWithUri(primaryUri, "primary URI");
    } catch (err) {
        if (isSrvLookupError(err) && fallbackUri !== primaryUri) {
            console.warn("Primary MongoDB SRV lookup failed. Trying fallback URI...");
            await connectWithUri(fallbackUri, "fallback URI");
            return;
        }

        throw err;
    }
};

module.exports = connectDB;