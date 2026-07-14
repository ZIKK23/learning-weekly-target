const express = require('express');
const router = express.Router();
const db = require('../config/db');
const activityController = require('../controllers/activitiesController');
const { requireAuth } = require('../middlewares/auth');
const { requireTarget } = require('../middlewares/requireTarget');

router.post('/start', requireAuth, requireTarget, activityController.startActivity);
router.post('/finish', requireAuth, activityController.finishActivity);

// GET /activities/weekly-learning-time - Get learning time for current week
router.get('/weekly-learning-time', requireAuth, async (req, res) => {
  
  try {
    const user_id = req.user.id;

    // 1. Get current active target for this user
    // We need to know WHICH modules are selected for the current week 
    const [targetRows] = await db.query(
      `SELECT id FROM targets 
       WHERE user_id = ?
         AND week_start <= CURRENT_DATE
         AND week_end >= CURRENT_DATE
       LIMIT 1`,
      [user_id]
    );

    let target_id = null;
    if (targetRows.length > 0) {
      target_id = targetRows[0].id;
    }

    // Get current week range (Monday to Sunday) - FIXED TIMEZONE HANDLING
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday
    
    // Calculate days to Monday
    const daysToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    
    // Format dates as YYYY-MM-DD strings to avoid timezone issues
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const day = String(monday.getDate()).padStart(2, '0');
    const weekStart = `${year}-${month}-${day}`;
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const yearEnd = sunday.getFullYear();
    const monthEnd = String(sunday.getMonth() + 1).padStart(2, '0');
    const dayEnd = String(sunday.getDate()).padStart(2, '0');
    const weekEnd = `${yearEnd}-${monthEnd}-${dayEnd}`;

    console.log(`📊 Fetching learning time for user ${user_id}, week: ${weekStart} to ${weekEnd}`);

    // Query daily learning time
    // Use actual_minutes from activities table (which is now proportionally calculated)
    // MODIFY: Only count activities for modules that are in the CURRENT TARGET
    
    let query = `
      SELECT
        TO_CHAR(a.date_completed, 'YYYY-MM-DD') as completion_date,
        SUM(a.actual_minutes) as total_minutes
      FROM activities a
    `;

    // Join with target_modules if a target exists
    if (target_id) {
      query += `
        JOIN target_modules tm ON a.module_id = tm.module_id 
        WHERE a.user_id = ?
          AND tm.target_id = ?
          AND a.date_completed BETWEEN ? AND ?
          AND a.status = 'completed'
      `;
    } else {
       // Fallback: If no target, maybe show nothing? Or show all?
       // User asked: "only modules selected". If no target selected, then 0.
       query += `
        WHERE 1=0 -- No target, no progress shown
          AND a.user_id = ?
          AND a.date_completed BETWEEN ? AND ?
          AND a.status = 'completed'
       `;
    }

    query += ` GROUP BY TO_CHAR(a.date_completed, 'YYYY-MM-DD')`;

    const queryParams = target_id 
      ? [user_id, target_id, weekStart, weekEnd + ' 23:59:59']
      : [user_id, weekStart, weekEnd + ' 23:59:59'];

    const [rows] = await db.query(query, queryParams);

    // Create map for quick lookup
    const learningMap = {};
    let totalMinutes = 0;
    rows.forEach(row => {
      const dateStr = row.completion_date;
      learningMap[dateStr] = Number(row.total_minutes); // Ensure number
      totalMinutes += Number(row.total_minutes);
    });

    // Build array for all 7 days (Mon-Sun)
    // We generated weekStart (Monday) manually earlier as 'YYYY-MM-DD'
    const [wYear, wMonth, wDay] = weekStart.split('-').map(Number);
    const mondayDate = new Date(wYear, wMonth - 1, wDay); // Local time monday

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyData = days.map((dayName, index) => {
      // Create fresh date object from Monday
      const currentDay = new Date(mondayDate);
      currentDay.setDate(mondayDate.getDate() + index);
      
      const y = currentDay.getFullYear();
      const m = String(currentDay.getMonth() + 1).padStart(2, '0');
      const d = String(currentDay.getDate()).padStart(2, '0');
      // Force string construction to ensure it matches DB format exactly
      const dateStr = `${y}-${m}-${d}`; 
      
      const minutes = learningMap[dateStr] || 0;

      console.log(`  ${dayName} (${dateStr}): ${minutes} min = ${(minutes/60).toFixed(1)} hr`);

      return {
        day: dayName,
        date: dateStr,
        minutes: minutes,
        hours: Math.round(minutes / 60 * 10) / 10
      };
    });

    res.json({
      status: 'ok',
      data: {
        weekStart,
        weekEnd,
        dailyData,
        totalMinutes,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10
      }
    });

  } catch (err) {
    console.error('Error fetching weekly learning time:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch learning time' });
  }
});

module.exports = router;
