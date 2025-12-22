const express = require('express');
const router = express.Router();
const{ addStructure, getAvailableModules } = require('../controllers/structureController');
const { requireAuth } = require('../middlewares/auth');

router.post('/add', addStructure);
router.get('/modules', requireAuth, getAvailableModules);

module.exports = router;

