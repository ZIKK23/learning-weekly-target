const express = require('express');
const router = express.Router();
const { getUserProgress } = require('../controllers/progressController');
const { requireAuth } = require('../middlewares/auth');

router.get('/user', requireAuth, getUserProgress);

module.exports = router;
