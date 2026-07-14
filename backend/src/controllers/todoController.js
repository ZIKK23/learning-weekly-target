const db = require('../config/db');

exports.getWeeklyTodo = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const today = new Date().toISOString().slice(0, 10);

    const [targetRows] = await db.query(
      `SELECT id, week_start, week_end
       FROM targets
       WHERE user_id = ?
         AND week_start <= CURRENT_DATE
         AND week_end >= CURRENT_DATE
       LIMIT 1`,
      [user_id]
    );

    if (targetRows.length === 0) {
      return res.json({
        status: "ok",
        todo: [],
        message: "No target set for this week"
      });
    }

    const target_id = targetRows[0].id;

    const [modules] = await db.query(
      `SELECT tm.module_id, m.name, m.est_minutes
       FROM target_modules tm
       JOIN modules m ON m.id = tm.module_id
       WHERE tm.target_id = ?`,
      [target_id]
    );

    if (modules.length === 0) {
      return res.json({
        status: "ok",
        todo: [],
        message: "This week's target has no modules"
      });
    }

    // Fetch selected study days
    const [targetDays] = await db.query(
      `SELECT TO_CHAR(date, 'FMDay') as day_of_week, date
       FROM target_days
       WHERE target_id = ?`,
      [target_id]
    );

    const [activities] = await db.query(
      `SELECT module_id, status, date_completed
       FROM submodule_time_log
       WHERE user_id = ?
         AND target_id = ?`,
      [user_id, target_id]
    );

    const activityMap = {};
    for (const a of activities) {
      activityMap[a.module_id] = {
        status: a.status,
        date_completed: a.date_completed
      };
    }

    // Module completion derived from submodule_progress, not a stored status column
    const moduleIds = modules.map(mod => mod.module_id);
    const [completionRows] = await db.query(
      `SELECT s.module_id,
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE sp.status = 'completed') as done
       FROM submodules s
       LEFT JOIN submodule_progress sp ON sp.submodule_id = s.id AND sp.user_id = ?
       WHERE s.module_id = ANY(?)
       GROUP BY s.module_id`,
      [user_id, moduleIds]
    );
    const completionMap = {};
    for (const row of completionRows) {
      completionMap[row.module_id] = row.total > 0 && row.done === row.total;
    }

    const finalTodo = modules.map(mod => {
      let finalStatus = 'not_started';

      if (activityMap[mod.module_id]?.status === 'in_progress') {
        finalStatus = 'in_progress';
      } else if (completionMap[mod.module_id]) {
        finalStatus = 'completed';
      }

      return {
        module_id: mod.module_id,
        name: mod.name,
        est_minutes: mod.est_minutes,
        status: finalStatus,
        date_completed: activityMap[mod.module_id]?.date_completed || null
      };
    });

    const responseData = {
      status: "ok",
      week_start: targetRows[0].week_start,
      week_end: targetRows[0].week_end,
      target_days: targetDays.map(d => d.day_of_week),
      todo: finalTodo,
      data: {
        target_id: target_id,
        modules: finalTodo
      }
    };

    console.log('📋 TODO Response for user', user_id, ':', {
      target_id,
      modules_count: finalTodo.length,
      target_days: targetDays.length
    });

    res.json(responseData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
