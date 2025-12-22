const express = require('express');
const router = express.Router();

const { sendWeeklyFeedback } = require('../controllers/weeklyFeedbackController');
const { requireAuth } = require('../middlewares/auth');

router.get('/weekly-feedback', requireAuth, sendWeeklyFeedback);

module.exports = router;
