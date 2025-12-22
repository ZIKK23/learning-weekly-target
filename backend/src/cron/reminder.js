const cron = require("node-cron");
const { sendDailyReminder } = require("../controllers/reminderController");

// CRON: Kirim daily reminder setiap hari JAM 09:00 
cron.schedule("0 9 * * *", async () => {
  console.log("Running daily reminder at 09:00...");
  await sendDailyReminder();
});

module.exports = {};
