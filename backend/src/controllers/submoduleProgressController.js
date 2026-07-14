const db = require("../config/db");
const { updateWeeklyStreak } = require("./streakController");

/**
 * Mark a submodule as completed for the current user
 * If all submodules in the module are completed, trigger daily_checkins and streak
 */
exports.markSubmoduleComplete = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { moduleId, submoduleId } = req.params;
    // const { actualMinutes } = req.body; // Deprecated: we use module duration for demo

    // 0. Module harus ada di target_modules minggu aktif user (sudah di-enroll & dipilih jadi target)
    const [enrollCheck] = await db.query(
      `SELECT tm.id FROM target_modules tm
       JOIN targets t ON t.id = tm.target_id
       WHERE t.user_id = ? AND tm.module_id = ?
         AND t.week_start <= CURRENT_DATE AND t.week_end >= CURRENT_DATE
       LIMIT 1`,
      [user_id, moduleId]
    );

    if (enrollCheck.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Modul ini belum dipilih di jadwal minggu ini. Pilih modul dulu lewat Manage Schedule / Choose Module.'
      });
    }

    // 1. Mark this submodule as completed
    await db.query(
      `INSERT INTO submodule_progress (user_id, submodule_id, status, completed_at)
       VALUES (?, ?, 'completed', NOW())
       ON CONFLICT (user_id, submodule_id) DO UPDATE SET
         status = 'completed',
         completed_at = COALESCE(submodule_progress.completed_at, NOW()),
         updated_at = NOW()`,
      [user_id, submoduleId]
    );

    // 1.5 Record proportional learning time for THIS submodule
    // Get module duration and total submodule count
    const [moduleRows] = await db.query('SELECT est_minutes FROM modules WHERE id = ?', [moduleId]);
    let moduleDuration = moduleRows.length > 0 ? Number(moduleRows[0].est_minutes) : 0;
    
    if (!moduleDuration || moduleDuration === 0) {
        console.warn(`⚠️ Module ${moduleId} has no est_minutes. Defaulting to 40 mins.`);
        moduleDuration = 40; // Reasonable default for a full module
    }
    
    // Get total submodules in this module
    const [submoduleCount] = await db.query(
      `SELECT COUNT(*) as total FROM submodules WHERE module_id = ?`,
      [moduleId]
    );
    
    const totalSubmodules = submoduleCount[0].total || 1; // Avoid division by zero
    const proportionalTime = Math.round(moduleDuration / totalSubmodules);
    
    console.log(`📊 Module ${moduleId}: ${moduleDuration} mins total / ${totalSubmodules} submodules = ${proportionalTime} mins per submodule`);

    // Find current active weekly target
    const [targets] = await db.query(
      `SELECT id FROM targets
       WHERE user_id = ?
         AND week_start <= CURRENT_DATE
         AND week_end >= CURRENT_DATE
       ORDER BY id DESC LIMIT 1`,
      [user_id]
    );
    
    const targetId = targets.length > 0 ? targets[0].id : 0;

    // Insert proportional time for THIS submodule completion
    await db.query(
      `INSERT INTO submodule_time_log (user_id, module_id, submodule_id, target_id, date_started, date_completed, actual_minutes, status, created_at)
       VALUES (?, ?, ?, ?, NOW() - (INTERVAL '1 minute' * ?), NOW(), ?, 'completed', NOW())`,
      [user_id, moduleId, submoduleId, targetId, proportionalTime, proportionalTime]
    );
    console.log(`⏱️ Recorded ${proportionalTime} mins for completing submodule ${submoduleId} of module ${moduleId}`);

    // 2. Check if ALL submodules in this module are now completed
    const [completedSubmodules] = await db.query(
      `SELECT COUNT(*) as completed 
       FROM submodule_progress sp
       JOIN submodules s ON sp.submodule_id = s.id
       WHERE sp.user_id = ? AND s.module_id = ? AND sp.status = 'completed'`,
      [user_id, moduleId]
    );

    const completed = completedSubmodules[0].completed;
    const allCompleted = totalSubmodules === completed;

    // 3. If all submodules completed, trigger daily_checkin and streak (NO additional activity record)
    if (allCompleted) {
      // Create daily checkin
      const today = new Date().toISOString().slice(0, 10);

      console.log(`🎯 All submodules completed! Creating daily_checkin for user ${user_id} on ${today}`);

      // Create daily_checkin for today (ignore if already exists)
      const [checkinResult] = await db.query(
        `INSERT INTO daily_checkins (user_id, checkin_date, created_at)
         VALUES (?, ?, NOW())
         ON CONFLICT (user_id, checkin_date) DO NOTHING`,
        [user_id, today]
      );

      console.log(`📅 Daily checkin result:`, checkinResult);

      // Module completion is derived from submodule_progress at read time (see
      // moduleContentController/progressController/etc) -- no separate status
      // column to keep in sync here anymore.

      // Update weekly streak
      console.log(`🔥 Calling updateWeeklyStreak for user ${user_id}...`);
      const streakValue = await updateWeeklyStreak(user_id);
      console.log(`✅ Streak update complete! Streak value: ${streakValue}`);

      console.log(`✅ Module ${moduleId} completed by user ${user_id} - Streak updated!`);
    } else {
      console.log(`⏳ Module ${moduleId} progress: ${completed}/${totalSubmodules} submodules completed`);
    }

    res.json({
      status: "ok",
      message: "Submodule marked as completed",
      moduleCompleted: allCompleted,
      progress: {
        completed: completed,
        total: totalSubmodules,
        percentage: Math.round((completed / totalSubmodules) * 100)
      }
    });

  } catch (err) {
    console.error("Error marking submodule complete:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get progress for all submodules in a module
 */
exports.getModuleProgress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { moduleId } = req.params;

    const [rows] = await db.query(
      `SELECT 
         s.id as submodule_id,
         s.title,
         COALESCE(sp.status, 'not_started') as status,
         sp.completed_at
       FROM submodules s
       LEFT JOIN submodule_progress sp ON s.id = sp.submodule_id AND sp.user_id = ?
       WHERE s.module_id = ?
       ORDER BY s.id`,
      [user_id, moduleId]
    );

    res.json({
      status: "ok",
      data: rows
    });

  } catch (err) {
    console.error("Error getting module progress:", err);
    res.status(500).json({ error: "Server error" });
  }
};
