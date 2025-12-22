const cron = require("node-cron");
const { sendWeeklyFeedback } = require("../controllers/weeklyFeedbackController");

// CRON: Kirim weekly feedback setiap Minggu malam JAM 20:00 
cron.schedule("0 20 * * 0", async () => {
  try {
    console.log("Running weekly feedback cron...");
    await sendWeeklyFeedback(); 
    console.log("Weekly feedback sent.");
  } catch (err) {
    console.error("Weekly feedback cron error:", err);
  }
});

module.exports = {};
