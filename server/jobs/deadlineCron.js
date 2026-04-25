const cron = require("node-cron");
const { monitorDeadlines } = require("../services/monitoringService");

exports.startDeadlineJob = () => {

  cron.schedule("*/2 * * * *", async () => {
    console.log("CRON TRIGGERED:", new Date());

    try {
        await monitorDeadlines();
        } catch (err) {
        console.error("CRON ERROR:", err.message);
        }
    });

};

///"0 */6 * * *"