const db = require('../config/db');
const { generateToken } = require('../helpers/token');

exports.login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }

    const user = rows[0];

    const token = generateToken(user);

    const [t] = await db.query(
      `SELECT id FROM targets
       WHERE user_id = ?
       AND week_start <= CURRENT_DATE
       AND week_end >= CURRENT_DATE`,
      [user.id]
    );

    const hasTarget = t.length > 0;

    res.json({
      status: "ok",
      user,
      has_target: hasTarget,
      message: hasTarget
        ? "Welcome back!"
        : "Please select a day & module to create this week's target.",
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    return res.json({
      status: "ok",
      message: "Logged out successfully"
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user is populated by requireAuth middleware
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch fresh user data
    const [rows] = await db.query(
      "SELECT id, email, display_name, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      status: "ok",
      user: rows[0]
    });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
