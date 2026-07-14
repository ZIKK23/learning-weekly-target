const db = require('../config/db');
const transporter = require('../config/mailer');
const { buildFeedbackEmail } = require('../helpers/feedbackEmailBuilder'); 

exports.sendWeeklyFeedback = async () => {
  try {
    console.log("Cron: fetching users with active weekly targets...");

    const [users] = await db.query(
      `SELECT DISTINCT u.id, u.email, u.display_name, t.id AS target_id,
              t.week_start, t.week_end
       FROM users u
       JOIN targets t ON t.user_id = u.id
       WHERE t.week_start <= CURRENT_DATE
         AND t.week_end >= CURRENT_DATE`
    );

    if (users.length === 0) {
      return console.log("Cron: no users have weekly targets. Skip sending.");
    }

    for (const user of users) {
      console.log(`Sending weekly feedback to ${user.email}...`);

      const [targetModules] = await db.query(
        `SELECT m.id, m.name, m.est_minutes
         FROM target_modules tm
         JOIN modules m ON m.id = tm.module_id
         WHERE tm.target_id = ?`,
        [user.target_id]
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
        est_minutes: m.est_minutes,
        status: completionMap[m.id] ? 'completed' : 'not_started'
      }));

      const [[minutes]] = await db.query(
        `SELECT SUM(actual_minutes) AS total_minutes
         FROM submodule_time_log
         WHERE user_id = ? AND target_id = ?`,
        [user.id, user.target_id]
      );

      const totalMinutes = minutes.total_minutes || 0;

      const completedModules = modules.filter(m => m.status === 'completed').length;
      const totalModules = modules.length;
      const progressPercent = totalModules === 0
        ? 0
        : Math.round((completedModules / totalModules) * 100);

      const html = buildFeedbackEmail({
        username: user.display_name,
        week_start: user.week_start,
        week_end: user.week_end,
        modules,
        totalMinutes,
        completedModules,
        totalModules,
        progressPercent
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "📘 Your Weekly Learning Summary",
        html
      });
    }

    console.log("Cron: weekly feedback sent to all users.");

  } catch (err) {
    console.error("Cron feedback error:", err);
  }
};
