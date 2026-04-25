const axios = require("axios");
const Agreement = require("../models/Agreement");
const Event = require("../models/Event");
const Dispute = require("../models/Dispute");
const Payment = require("../models/Payment");
const User = require("../models/User");

const COMPLETED_STATUSES = ["completed", "paid", "work_done"];

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const getAgreementDeadline = (agreement) => {
  if (agreement?.deadlineDate) {
    const d = new Date(agreement.deadlineDate);
    if (!Number.isNaN(d.getTime())) return d;
  }

  if (agreement?.date) {
    const d = new Date(agreement.date);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
};

const monthLabel = (date) =>
  new Date(date).toLocaleString("en-US", { month: "short", year: "numeric" });

const getLastSixMonthsSkeleton = () => {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: monthLabel(d), count: 0 });
  }

  return months;
};

const buildMyReport = async (authUser) => {
  const email = normalizeEmail(authUser.email);

  const user = await User.findById(authUser.id).select("email role region trustScore");

  if (!user) {
    return null;
  }

  const [agreements, disputes, events, payments] = await Promise.all([
    Agreement.find({
      $or: [{ providerEmail: email }, { clientEmail: email }]
    }).sort({ createdAt: -1 }),
    Dispute.find({ userEmail: email }),
    Event.find({ user: authUser.id }).sort({ createdAt: 1 }),
    Payment.find({
      $or: [{ clientEmail: email }, { providerEmail: email }],
      status: "completed"
    })
  ]);

  const totalAgreements = agreements.length;

  const completedAgreements = agreements.filter((a) => COMPLETED_STATUSES.includes(a.status));
  const onTimeCompleted = completedAgreements.filter((a) => {
    const deadline = getAgreementDeadline(a);
    if (!deadline) return true;
    return new Date(a.updatedAt) <= deadline;
  }).length;

  const onTimeRate = completedAgreements.length > 0
    ? Number(((onTimeCompleted / completedAgreements.length) * 100).toFixed(2))
    : 0;

  const disputesCount = disputes.length;

  const penaltiesFromAgreements = agreements.filter((a) => Number(a.penaltyAccumulated || 0) > 0).length;
  const penaltiesFromEvents = events.filter((e) => Number(e.penaltyAmount || 0) > 0).length;
  const penalties = Math.max(penaltiesFromAgreements, penaltiesFromEvents);

  const monthlySkeleton = getLastSixMonthsSkeleton();
  const monthlyMap = new Map(monthlySkeleton.map((m) => [m.label, 0]));

  events.forEach((event) => {
    const label = monthLabel(event.createdAt);
    if (monthlyMap.has(label)) {
      monthlyMap.set(label, (monthlyMap.get(label) || 0) + 1);
    }
  });

  const monthlyActivity = monthlySkeleton.map((m) => monthlyMap.get(m.label) || 0);
  const monthlyActivityWithLabels = monthlySkeleton.map((m) => ({
    month: m.label,
    count: monthlyMap.get(m.label) || 0
  }));

  return {
    user: {
      email: user.email,
      role: user.role,
      region: user.region || "Unknown",
      trustScore: Number(user.trustScore || 0)
    },
    totalAgreements,
    onTimeRate,
    disputes: disputesCount,
    penalties,
    trustScore: Number(user.trustScore || 0),
    monthlyActivity,
    monthlyActivityWithLabels,
    completedPayments: payments.length
  };
};

const getMyReport = async (req, res) => {
  try {
    const report = await buildMyReport(req.user);

    if (!report) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error("MY REPORT ERROR:", error);
    return res.status(500).json({ message: "Failed to generate report" });
  }
};

const downloadMyReportPdf = async (req, res) => {
  try {
    const report = await buildMyReport(req.user);

    if (!report) {
      return res.status(404).json({ message: "User not found" });
    }

    const monthlyRows = report.monthlyActivityWithLabels
      .map((m) => `<tr><td style=\"padding:8px;border:1px solid #ddd;\">${m.month}</td><td style=\"padding:8px;border:1px solid #ddd;\">${m.count}</td></tr>`)
      .join("");

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 24px; color: #111827;">
          <h1 style="margin-bottom: 6px;">My Behavior Report</h1>
          <p style="margin-top: 0; color: #6b7280;">ShohojTrust Personal Performance Snapshot</p>

          <h2>User Info</h2>
          <p><b>Email:</b> ${report.user.email}</p>
          <p><b>Role:</b> ${report.user.role}</p>
          <p><b>Region:</b> ${report.user.region}</p>
          <p><b>Trust Score:</b> ${report.trustScore}</p>

          <h2>Summary Metrics</h2>
          <ul>
            <li>Total Agreements: ${report.totalAgreements}</li>
            <li>On-time Completion Rate: ${report.onTimeRate}%</li>
            <li>Disputes: ${report.disputes}</li>
            <li>Penalties: ${report.penalties}</li>
            <li>Completed Payments: ${report.completedPayments}</li>
          </ul>

          <h2>Monthly Activity (Last 6 Months)</h2>
          <table style="border-collapse: collapse; width: 100%; margin-top: 8px;">
            <thead>
              <tr>
                <th style="padding:8px;border:1px solid #ddd;background:#f3f4f6;text-align:left;">Month</th>
                <th style="padding:8px;border:1px solid #ddd;background:#f3f4f6;text-align:left;">Events</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const response = await axios.post(
      "https://api.pdfshift.io/v3/convert/pdf",
      { source: html },
      {
        auth: {
          username: "api",
          password: process.env.PDFSHIFT_API_KEY
        },
        responseType: "arraybuffer"
      }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=my-behavior-report.pdf");
    return res.send(response.data);
  } catch (error) {
    console.error("REPORT PDF ERROR:", error.response?.data || error.message);
    return res.status(500).json({ message: "Failed to generate PDF report" });
  }
};

module.exports = {
  getMyReport,
  downloadMyReportPdf
};
