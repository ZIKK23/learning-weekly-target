const db = require('../config/db');
const { updateWeeklyStreak } = require("./streakController");

exports.startActivity = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const target_id = req.target_id;
    const { module_id } = req.body;

    if (!target_id) {
      return res.status(400).json({ error: "You have no active target for this week" });
    }

    const [active] = await db.query(
      `SELECT id FROM activities WHERE user_id = ? AND target_id = ? AND status = 'in_progress'`,
      [user_id, target_id]
    );

    if (active.length > 0) {
      return res.status(400).json({
        error: "You already have an ongoing activity",
        activity_id: active[0].id
      });
    }

    const [result] = await db.query(
      `INSERT INTO activities (user_id, module_id, target_id, date_started, status)
       VALUES (?, ?, ?, NOW(), 'in_progress')`,
      [user_id, module_id, target_id]
    );

    res.json({
      status: "ok",
      activity_id: result.insertId,
      message: "Activity started"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.finishActivity = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { activity_id } = req.body;

    const [rows] = await db.query(
      `SELECT date_started, module_id, target_id 
       FROM activities
       WHERE id = ? AND user_id = ?`,
      [activity_id, user_id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: "You do not have permission to finish this activity" });
    }

    const { date_started, module_id, target_id } = rows[0];

    const start = new Date(date_started);
    const end = new Date();
    const diff = Math.round((end - start) / 1000 / 60);

    await db.query(
      `UPDATE activities 
       SET date_completed = NOW(), actual_minutes = ?, status = 'completed'
       WHERE id = ?`,
      [diff, activity_id]
    );

    const [[modCheck]] = await db.query(
      `SELECT status FROM target_modules WHERE target_id = ? AND module_id = ?`,
      [target_id, module_id]
    );

    if (!modCheck) {
      return res.json({
        status: "ok",
        actual_minutes: diff,
        target_status: "unchanged (module not in target)"
      });
    }

    if (modCheck.status === "completed") {
      return res.json({
        status: "ok",
        actual_minutes: diff,
        target_status: "already completed"
      });
    }

    const [dayRows] = await db.query(
      `SELECT 1 FROM target_days
       WHERE target_id = ? AND day_of_week = TO_CHAR(CURRENT_DATE, 'FMDay')`,
      [target_id]
    );

    if (dayRows.length === 0) {
      return res.json({
        status: "ok",
        actual_minutes: diff,
        target_status: "unchanged (not a target day)"
      });
    }

    await db.query(
      `UPDATE target_modules 
       SET status = 'completed'
       WHERE target_id = ? AND module_id = ?`,
      [target_id, module_id]
    );

    const streak = await updateWeeklyStreak(user_id);

    res.json({
      status: "ok",
      actual_minutes: diff,
      streak,
      target_status: "completed"
    });

  } catch (err) {
    console.error("FINISH ERROR:", err);
    res.status(500).json({ error: "server error finish" });
  }
};
