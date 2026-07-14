const db = require('../config/db');

exports.requireTarget = async (req, res, next) => {
  const user_id = req.user.id;

  const [rows] = await db.query(
    `SELECT id FROM targets
     WHERE user_id = ?
     AND week_start <= CURRENT_DATE
     AND week_end >= CURRENT_DATE`,
    [user_id]
  );

  if (rows.length === 0) {
    return res.status(400).json({
      error: "You haven't set a target for this week."
    });
  }

  req.target_id = rows[0].id;

  next();
};
