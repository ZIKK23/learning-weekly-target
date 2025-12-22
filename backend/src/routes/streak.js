const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { requireAuth } = require('../middlewares/auth');

router.get("/streak", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get current week's streak data - Return dates as STRINGS to avoid timezone issues
    const [rows] = await db.query(
      `SELECT 
        id, user_id, streak, last_completion_date,
        DATE_FORMAT(week_start, '%Y-%m-%d') as week_start,
        DATE_FORMAT(week_end, '%Y-%m-%d') as week_end 
       FROM weekly_streaks 
       WHERE user_id = ?
       ORDER BY week_start DESC LIMIT 1`,
      [user_id]
    );

    const streakData = rows[0] || null;
    
    // Get daily checkins for current week to show which days are active
    let dailyStatus = [];
    
    if (streakData) {
      const [checkins] = await db.query(
        `SELECT DATE_FORMAT(checkin_date, '%Y-%m-%d') as checkin_date 
         FROM daily_checkins 
         WHERE user_id = ? 
         AND checkin_date BETWEEN ? AND ?
         ORDER BY checkin_date`,
        [user_id, streakData.week_start, streakData.week_end]
      );
      
      console.log(`📅 Found ${checkins.length} checkins for week ${streakData.week_start} to ${streakData.week_end}`);
      
      // Map checkin dates to set for fast lookup
      const checkinDates = new Set(
        checkins.map(row => row.checkin_date)
      );
      
      // Build array for Mon-Sun with active status
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      // streakData.week_start is now 'YYYY-MM-DD' string due to DATE_FORMAT
      const weekStartStr = streakData.week_start;
      const [year, month, day] = weekStartStr.split('-').map(Number);
      
      console.log(`Original streak week start: ${year}-${month}-${day}`);
      
      // Create date object from DB date
      const dbWeekStartDate = new Date(year, month - 1, day);
      
      // Calculate TRUE Monday of that week
      // getDay(): 0=Sun, 1=Mon, ..., 6=Sat
      const dbDay = dbWeekStartDate.getDay();
      const daysToMonday = dbDay === 0 ? 6 : dbDay - 1;
      
      const mondayDate = new Date(dbWeekStartDate);
      mondayDate.setDate(dbWeekStartDate.getDate() - daysToMonday);
      
      console.log(`Normalized week start (Monday): ${mondayDate.toISOString().slice(0, 10)}`);

      dailyStatus = days.map((dayName, index) => {
        // Calculate date for each day starting from True Monday
        const currentDay = new Date(mondayDate);
        currentDay.setDate(mondayDate.getDate() + index);
        
        const y = currentDay.getFullYear();
        const m = String(currentDay.getMonth() + 1).padStart(2, '0');
        const d = String(currentDay.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        
        const isActive = checkinDates.has(dateStr);
        
        console.log(`${dayName} (${dateStr}): ${isActive ? '🔥' : '❌'}`);
        
        return {
          day: dayName,
          date: dateStr,
          active: isActive
        };
      });
    }

    res.json({
      status: "ok",
      streak: streakData,
      dailyStatus: dailyStatus
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const { getLeaderboard } = require("../controllers/streakController");

// Handle GET /leaderboard (mounted as / in server.js)
router.get("/", getLeaderboard);

module.exports = router;
router.get("/leaderboard", getLeaderboard);

module.exports = router;
