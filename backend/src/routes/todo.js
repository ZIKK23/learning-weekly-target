const express = require('express');
const router = express.Router();

const { getWeeklyTodo } = require('../controllers/todoController');
const { requireAuth } = require('../middlewares/auth');

router.get('/', requireAuth, getWeeklyTodo);

module.exports = router;
