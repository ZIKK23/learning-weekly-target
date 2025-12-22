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

    // 1. Mark this submodule as completed
    await db.query(
      `INSERT INTO submodule_progress (user_id, submodule_id, status, completed_at)
       VALUES (?, ?, 'completed', NOW())
       ON DUPLICATE KEY UPDATE 
         status = 'completed',
         completed_at = IFNULL(completed_at, NOW()),
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
         AND week_start <= CURDATE() 
         AND week_end >= CURDATE() 
       ORDER BY id DESC LIMIT 1`,
      [user_id]
    );
    
    const targetId = targets.length > 0 ? targets[0].id : 0;

    // Insert proportional time for THIS submodule completion
    await db.query(
      `INSERT INTO activities (user_id, module_id, target_id, date_started, date_completed, actual_minutes, status, created_at)
       VALUES (?, ?, ?, DATE_SUB(NOW(), INTERVAL ? MINUTE), NOW(), ?, 'completed', NOW())`,
      [user_id, moduleId, targetId, proportionalTime, proportionalTime]
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
        `INSERT IGNORE INTO daily_checkins (user_id, checkin_date, created_at)
         VALUES (?, ?, NOW())`,
        [user_id, today]
      );

      console.log(`📅 Daily checkin result:`, checkinResult);

      // Update target_modules status to 'completed' for this module
      // Find the current week's target and update the module status
      const [targetRows] = await db.query(
        `SELECT t.id FROM targets t
         WHERE t.user_id = ?
           AND t.week_start <= CURDATE()
           AND t.week_end >= CURDATE()
         LIMIT 1`,
        [user_id]
      );

      if (targetRows.length > 0) {
        const targetId = targetRows[0].id;
        
        const [updateResult] = await db.query(
          `UPDATE target_modules
           SET status = 'completed', updated_at = NOW()
           WHERE target_id = ? AND module_id = ?`,
          [targetId, moduleId]
        );
        
        console.log(`📊 Updated target_modules: target_id=${targetId}, module_id=${moduleId}`, updateResult);
      } else {
        console.log(`⚠️ No active target found for user ${user_id} this week`);
      }

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
