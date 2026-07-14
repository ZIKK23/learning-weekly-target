const db = require("../config/db");
const { getWeekRange } = require("../helpers/week");

exports.updateWeeklyStreak = async (user_id) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { week_start, week_end } = getWeekRange(new Date());

    console.log(`🔄 Updating streak for user ${user_id}, week: ${week_start} - ${week_end}, today: ${today}`);

    const [rows] = await db.query(
      `SELECT * FROM weekly_streaks 
       WHERE user_id = ? AND week_start = ?`,
      [user_id, week_start]
    );

    let streak = 1;

    if (rows.length === 0) {
      console.log(`📝 Creating NEW weekly_streaks entry for user ${user_id}`);
      await db.query(
        `INSERT INTO weekly_streaks (user_id, week_start, week_end, streak, last_completion_date)
         VALUES (?, ?, ?, 1, ?)`,
        [user_id, week_start, week_end, today]
      );
      console.log(`✅ Weekly streak created! User ${user_id}, streak: 1`);
      return 1;
    }

    const row = rows[0];

    const [[yesterday]] = await db.query(
      `SELECT CURRENT_DATE = (?::date + INTERVAL '1 day') AS is_yesterday`,
      [row.last_completion_date]
    );

    if (yesterday && yesterday.is_yesterday) {
      streak = row.streak + 1;
      console.log(`📈 Continuing streak: ${row.streak} -> ${streak}`);
    } else {
      streak = 1; 
      console.log(`🔄 Resetting streak to 1 (previous: ${row.streak})`);
    }

    await db.query(
      `UPDATE weekly_streaks
       SET streak = ?, last_completion_date = ?
       WHERE id = ?`,
      [streak, today, row.id]
    );

    console.log(`✅ Weekly streak updated! User ${user_id}, streak: ${streak}`);
    return streak;

  } catch (err) {
    console.error("❌ Streak update error:", err);
    return 0;
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.display_name, u.created_at, s.streak 
       FROM weekly_streaks s 
       JOIN users u ON s.user_id = u.id 
       ORDER BY s.streak DESC 
       LIMIT 10`
    );

    res.json({
      status: "ok",
      data: rows
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
