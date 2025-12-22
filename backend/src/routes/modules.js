const express = require('express');
const router = express.Router();
const { getModuleOverview, getSubmoduleContent } = require('../controllers/moduleContentController');
const { markSubmoduleComplete, getModuleProgress } = require('../controllers/submoduleProgressController');
const { requireAuth } = require('../middlewares/auth');



// Get module overview (new - for module landing page)
router.get('/:id', requireAuth, getModuleOverview);

// Get individual submodule content (new - for submodule pages)
router.get('/:moduleId/submodule/:submoduleId', requireAuth, getSubmoduleContent);

// Mark submodule as completed
router.post('/:moduleId/submodule/:submoduleId/complete', requireAuth, markSubmoduleComplete);

// Get progress for all submodules in a module
router.get('/:moduleId/progress', requireAuth, getModuleProgress);

module.exports = router;
