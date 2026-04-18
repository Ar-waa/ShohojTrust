const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Payment = require("../models/Payment");
const Agreement = require("../models/Agreement");
const User = require("../models/User");

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const payments = await Payment.find({});
    if (!payments.length) {
      console.log("No payment records found to backfill.");
      await mongoose.disconnect();
      return;
    }

    let updated = 0;

    for (const payment of payments) {
      const update = {};

      if (payment.agreementId) {
        const agreement = await Agreement.findById(payment.agreementId);
        if (agreement) {
          if (!payment.agreementTitle) update.agreementTitle = agreement.title || "Untitled Agreement";
          if (!payment.agreementCategory) update.agreementCategory = agreement.category || "";
          if (!payment.agreementDueDate) update.agreementDueDate = agreement.date || "";
          if (!payment.providerEmail) update.providerEmail = agreement.providerEmail;
          if (!payment.clientEmail) update.clientEmail = agreement.clientEmail;
        }
      }

      if (!payment.clientUserId && payment.clientEmail) {
        const clientUser = await User.findOne({ email: payment.clientEmail });
        if (clientUser) update.clientUserId = clientUser._id;
      }

      if (!payment.providerUserId && payment.providerEmail) {
        const providerUser = await User.findOne({ email: payment.providerEmail });
        if (providerUser) update.providerUserId = providerUser._id;
      }

      if (!payment.currency) update.currency = "BDT";
      if (!payment.recordedBy) update.recordedBy = "system";
      if (!payment.paidAt && payment.completedAt) update.paidAt = payment.completedAt;
      if (!payment.paidAt && !payment.completedAt) update.paidAt = payment.createdAt || new Date();

      if (Object.keys(update).length) {
        await Payment.updateOne({ _id: payment._id }, { $set: update });
        updated += 1;
      }
    }

    console.log(`Backfill complete. Updated ${updated} payment document(s).`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("Backfill failed:", err.message);
    process.exit(1);
  }
};

run();
