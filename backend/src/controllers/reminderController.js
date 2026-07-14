const db = require("../config/db");
const transporter = require("../config/mailer");
const { getWeekRange } = require("../helpers/week");
const { buildReminderEmail } = require("../helpers/reminderEmailBuilder");

exports.sendDailyReminder = async () => {
  try {
    const [users] = await db.query(
      "SELECT id, email, display_name FROM users"
    );

    for (const user of users) {
      await sendReminderToUser(user);
    }

    console.log("Daily reminder sent.");

  } catch (err) {
    console.error("Reminder Error:", err);
  }
};

async function sendReminderToUser(user) {
  const today = new Date();
  const { week_start, week_end } = getWeekRange(today);

  const [[target]] = await db.query(
    `SELECT id FROM targets
     WHERE user_id = ? AND week_start = ? AND week_end = ?`,
    [user.id, week_start, week_end]
  );

  if (!target) return; 

  const target_id = target.id;

  const [todayRows] = await db.query(
    `SELECT 1 FROM target_days
     WHERE target_id = ?
     AND date = CURRENT_DATE`,
    [target_id]
  );

  const isTargetDay = todayRows.length > 0;

  const [targetModules] = await db.query(
    `SELECT m.id, m.name
     FROM target_modules tm
     JOIN modules m ON m.id = tm.module_id
     WHERE tm.target_id = ?`,
    [target_id]
  );

  // Module completion derived from submodule_progress, not a stored status column
  const moduleIds = targetModules.map(m => m.id);
  const [completionRows] = await db.query(
    `SELECT s.module_id,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE sp.status = 'completed') as done
     FROM submodules s
     LEFT JOIN submodule_progress sp ON sp.submodule_id = s.id AND sp.user_id = ?
     WHERE s.module_id = ANY(?)
     GROUP BY s.module_id`,
    [user.id, moduleIds]
  );
  const completionMap = {};
  for (const row of completionRows) {
    completionMap[row.module_id] = row.total > 0 && row.done === row.total;
  }
  const modules = targetModules.map(m => ({
    name: m.name,
    status: completionMap[m.id] ? 'completed' : 'not_started'
  }));

  const unfinished = modules.filter(m => m.status !== "completed");

  let nextStudyDate = null;

  if (!isTargetDay) {
    const [[nextDay]] = await db.query(
      `SELECT date FROM target_days
       WHERE target_id = ? AND date > CURRENT_DATE
       ORDER BY date ASC LIMIT 1`,
      [target_id]
    );

    nextStudyDate = nextDay?.date || null;
  }

  const html = buildReminderEmail({
    username: user.display_name,
    isTargetDay,
    modules,
    unfinishedModules: unfinished,
    nextStudyDate
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: user.email,
    subject: "🔔 Your Daily Reminder",
    html
  });
}
