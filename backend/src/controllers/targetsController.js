const db = require('../config/db');
const { getWeekRange, convertDayNameToDate } = require('../helpers/week');

exports.createWeeklyTarget = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const user_id = req.user.id;
    const { days, modules } = req.body;

    if (!Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ error: "Must select at least 1 day" });
    }

    if (!Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({ error: "Must select at least 1 module" });
    }

    const { week_start, week_end } = getWeekRange(new Date());

    // Check if target exists
    const [exist] = await conn.query(
      `SELECT id FROM targets
       WHERE user_id = ?
       AND week_start <= CURDATE()
       AND week_end >= CURDATE()`,
      [user_id]
    );

    await conn.beginTransaction();

    let targetId;
    let message;

    if (exist.length > 0) {
      // UPDATE EXISTING TARGET
      targetId = exist[0].id;
      message = "Weekly target successfully updated!";

      // 1. Update Days: simple replace
      await conn.query("DELETE FROM target_days WHERE target_id = ?", [targetId]);
      
      for (const dayName of days) {
        const date = convertDayNameToDate(dayName, week_start);
        await conn.query(
          "INSERT INTO target_days (target_id, day_of_week, date) VALUES (?, ?, ?)",
          [targetId, dayName, date]
        );
      }

      // 2. Update Modules: smart sync to preserve status
      // Get existing modules
      const [existingModules] = await conn.query(
        "SELECT module_id FROM target_modules WHERE target_id = ?",
        [targetId]
      );
      const existingModuleIds = existingModules.map(m => m.module_id);

      // Determine additions and removals
      const toAdd = modules.filter(id => !existingModuleIds.includes(id));
      const toRemove = existingModuleIds.filter(id => !modules.includes(id));

      // Remove unselected modules
      if (toRemove.length > 0) {
        await conn.query(
          `DELETE FROM target_modules WHERE target_id = ? AND module_id IN (?)`,
          [targetId, toRemove]
        );
      }

      // Add new selected modules
      for (const moduleId of toAdd) {
        await conn.query(
          "INSERT INTO target_modules (target_id, module_id, status) VALUES (?, ?, 'not_started')",
          [targetId, moduleId]
        );
      }

    } else {
      // CREATE NEW TARGET
      message = "Weekly target successfully created!";
      
      const [targetResult] = await conn.query(
        "INSERT INTO targets (user_id, week_start, week_end) VALUES (?, ?, ?)",
        [user_id, week_start, week_end]
      );

      targetId = targetResult.insertId;

      for (const dayName of days) {
        const date = convertDayNameToDate(dayName, week_start);
        await conn.query(
          "INSERT INTO target_days (target_id, day_of_week, date) VALUES (?, ?, ?)",
          [targetId, dayName, date]
        );
      }

      for (const moduleId of modules) {
        await conn.query(
          "INSERT INTO target_modules (target_id, module_id, status) VALUES (?, ?, 'not_started')",
          [targetId, moduleId]
        );
      }
    }

    await conn.commit();

    res.json({
      status: "ok",
      message: message,
      target_id: targetId
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
};
