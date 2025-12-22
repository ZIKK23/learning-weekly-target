require('dotenv').config();
const express = require('express');
const cors = require('cors');

// CRON JOBS
require('./src/cron/weeklyFeedback');
require('./src/cron/reminder');

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
const authRoutes = require('./src/routes/auth');
const targetRoutes = require('./src/routes/targets');
const activityRoutes = require('./src/routes/activities');
const streakRoutes = require('./src/routes/streak');
const todoRoutes = require('./src/routes/todo');
const feedbackRoutes = require('./src/routes/feedback');
const structureRoutes = require('./src/routes/structure');
const progressRoutes = require('./src/routes/progress');
const modulesRoutes = require('./src/routes/modules');

// Routes
app.use('/auth', authRoutes);
app.use('/targets', targetRoutes);
app.use('/activities', activityRoutes);
app.use('/streak', streakRoutes);
app.use('/leaderboard', streakRoutes);
app.use('/todo', todoRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/structure', structureRoutes);
app.use('/progress', progressRoutes);
console.log('✓ Progress routes registered at /progress');
app.use('/modules', modulesRoutes);




app.get('/', (req, res) => {
  res.send('API is running...');
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

