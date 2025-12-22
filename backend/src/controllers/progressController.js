const db = require('../config/db');

// Get user's overall progress (all classes with ALL their modules)
exports.getUserProgress = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Step 1: Get all classes user has ever enrolled in (has targets for)
    const [enrolledClasses] = await db.query(`
      SELECT DISTINCT c.id as class_id, c.name as class_name
      FROM targets t
      JOIN target_modules tm ON tm.target_id = t.id
      JOIN modules m ON m.id = tm.module_id
      JOIN classes c ON c.id = m.class_id
      WHERE t.user_id = ?
      ORDER BY c.id
    `, [user_id]);

    if (enrolledClasses.length === 0) {
      return res.json({
        status: 'ok',
        data: []
      });
    }

    const result = [];

    // Step 2: For each class, get ALL modules + their status
    for (const cls of enrolledClasses) {
      // Get ALL modules in this class
      const [allModules] = await db.query(`
        SELECT m.id as module_id, m.name as module_name, m.est_minutes
        FROM modules m
        WHERE m.class_id = ?
        ORDER BY m.id
      `, [cls.class_id]);

      // Get latest status for each module from user's history
      const modules = [];
      for (const module of allModules) {
        const [statusRows] = await db.query(`
          SELECT tm.status
          FROM target_modules tm
          JOIN targets t ON t.id = tm.target_id
          WHERE t.user_id = ? AND tm.module_id = ?
          ORDER BY t.week_end DESC, tm.id DESC
          LIMIT 1
        `, [user_id, module.module_id]);

        modules.push({
          module_id: module.module_id,
          module_name: module.module_name,
          est_minutes: module.est_minutes,
          status: (statusRows.length > 0 && statusRows[0].status) || 'not_started'
        });
      }

      // Calculate progress
      const completedCount = modules.filter(m => m.status === 'completed').length;
      const totalCount = modules.length;
      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      result.push({
        class_id: cls.class_id,
        class_name: cls.class_name,
        progress,
        completed_modules: completedCount,
        total_modules: totalCount,
        modules: modules
      });
    }

    res.json({
      status: 'ok',
      data: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
