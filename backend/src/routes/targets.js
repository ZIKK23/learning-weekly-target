const express = require('express');
const router = express.Router();
const { createWeeklyTarget } = require('../controllers/targetsController');
const { requireAuth } = require('../middlewares/auth');

router.post('/create', requireAuth, createWeeklyTarget);

module.exports = router;
