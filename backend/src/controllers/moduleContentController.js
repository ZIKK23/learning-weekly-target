const db = require('../config/db');



// Get module overview (for module landing page)
exports.getModuleOverview = async (req, res) => {
  try {
    const user_id = req.user.id;
    const module_id = parseInt(req.params.id);

    // Get module info with class_id
    const [moduleRows] = await db.query(
      `SELECT m.id, m.name, m.description, m.est_minutes, m.class_id, c.name as class_name
       FROM modules m
       JOIN classes c ON c.id = m.class_id
       WHERE m.id = ?`,
      [module_id]
    );

    if (moduleRows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const module = moduleRows[0];

    // Get submodules (without full content, only titles)
    const [submodules] = await db.query(
      `SELECT id, title
       FROM submodules
       WHERE module_id = ?
       ORDER BY id ASC`,
      [module_id]
    );

    // Get module status
    let moduleStatus = 'not_started';
    const [targetRows] = await db.query(
      `SELECT id FROM targets
       WHERE user_id = ?
         AND week_start <= CURDATE()
         AND week_end >= CURDATE()
       LIMIT 1`,
      [user_id]
    );

    if (targetRows.length > 0) {
      const [statusRows] = await db.query(
        `SELECT status FROM target_modules
         WHERE target_id = ? AND module_id = ?`,
        [targetRows[0].id, module_id]
      );
      if (statusRows.length > 0) {
        moduleStatus = statusRows[0].status;
      }
    }

    // Get all modules in class with submodules
    const [classModules] = await db.query(
      `SELECT m.id as module_id, m.name,
        (
          SELECT tm.status 
          FROM target_modules tm
          JOIN targets t ON t.id = tm.target_id
          WHERE tm.module_id = m.id AND t.user_id = ?
          ORDER BY t.week_end DESC, tm.id DESC
          LIMIT 1
        ) as status
       FROM modules m
       WHERE m.class_id = ?
       ORDER BY m.id ASC`,
      [user_id, module.class_id]
    );
    
    // For each module, get its submodules with completion status
    for (const mod of classModules) {
      const [modSubs] = await db.query(
        `SELECT s.id, s.title, 
                COALESCE(sp.status, 'not_started') as completed_status,
                (sp.status = 'completed') as completed
         FROM submodules s
         LEFT JOIN submodule_progress sp ON s.id = sp.submodule_id AND sp.user_id = ?
         WHERE s.module_id = ? 
         ORDER BY s.id ASC`,
        [user_id, mod.module_id]
      );
      mod.submodules = modSubs;
      mod.status = mod.status || 'not_started';
    }

    const totalModules = classModules.length;
    const completedModules = classModules.filter(m => m.status === 'completed').length;
    const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    res.json({
      status: 'ok',
      data: {
        module: {
          id: module.id,
          name: module.name,
          class_name: module.class_name,
          description: module.description,
          est_minutes: module.est_minutes,
          status: moduleStatus
        },
        submodules: submodules,
        progress: {
          total_modules: totalModules,
          completed_modules: completedModules,
          progress_percent: progressPercent,
          modules_list: classModules
        }
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get individual submodule content with navigation
exports.getSubmoduleContent = async (req, res) => {
  try {
    const user_id = req.user.id;
    const module_id = parseInt(req.params.moduleId);
    const submodule_id = parseInt(req.params.submoduleId);

    // Get module info
    const [moduleRows] = await db.query(
      `SELECT m.id, m.name, m.description, m.est_minutes, m.class_id, c.name as class_name
       FROM modules m
       JOIN classes c ON c.id = m.class_id
       WHERE m.id = ?`,
      [module_id]
    );

    if (moduleRows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const module = moduleRows[0];

    // Get the specific submodule
    const [submoduleRows] = await db.query(
      `SELECT id, title, content
       FROM submodules
       WHERE id = ? AND module_id = ?`,
      [submodule_id, module_id]
    );

    if (submoduleRows.length === 0) {
      return res.status(404).json({ error: 'Submodule not found' });
    }

    const submodule = submoduleRows[0];

    // Get ALL submodules across ALL modules in the class (for navigation)
    const [allClassSubmodules] = await db.query(
      `SELECT s.id as submodule_id, s.module_id, s.title, m.name as module_name
       FROM submodules s
       JOIN modules m ON m.id = s.module_id
       WHERE m.class_id = ?
       ORDER BY m.id ASC, s.id ASC`,
      [module.class_id]
    );

    // Find current submodule index
    const currentIndex = allClassSubmodules.findIndex(
      s => s.submodule_id === submodule_id && s.module_id === module_id
    );

    // Determine prev/next
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < allClassSubmodules.length - 1;

    const navigation = {
      has_previous: hasPrevious,
      previous: hasPrevious ? {
        module_id: allClassSubmodules[currentIndex - 1].module_id,
        submodule_id: allClassSubmodules[currentIndex - 1].submodule_id
      } : null,
      has_next: hasNext,
      next: hasNext ? {
        module_id: allClassSubmodules[currentIndex + 1].module_id,
        submodule_id: allClassSubmodules[currentIndex + 1].submodule_id
      } : null
    };

    // Get all modules in class with their submodules for sidebar
    const [classModules] = await db.query(
      `SELECT m.id as module_id, m.name,
        (
          SELECT tm.status 
          FROM target_modules tm
          JOIN targets t ON t.id = tm.target_id
          WHERE tm.module_id = m.id AND t.user_id = ?
          ORDER BY t.week_end DESC, tm.id DESC
          LIMIT 1
        ) as status
       FROM modules m
       WHERE m.class_id = ?
       ORDER BY m.id ASC`,
      [user_id, module.class_id]
    );
    
    // For each module, get its submodules with completion status
    for (const mod of classModules) {
      const [modSubs] = await db.query(
        `SELECT s.id, s.title, 
                COALESCE(sp.status, 'not_started') as completed_status,
                (sp.status = 'completed') as completed
         FROM submodules s
         LEFT JOIN submodule_progress sp ON s.id = sp.submodule_id AND sp.user_id = ?
         WHERE s.module_id = ? 
         ORDER BY s.id ASC`,
        [user_id, mod.module_id]
      );
      mod.submodules = modSubs;
      mod.status = mod.status || 'not_started';
    }

    const totalModules = classModules.length;
    const completedModules = classModules.filter(m => m.status === 'completed').length;
    const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    res.json({
      status: 'ok',
      data: {
        module: {
          id: module.id,
          name: module.name,
          class_name: module.class_name,
          description: module.description,
          est_minutes: module.est_minutes
        },
        submodule: submodule,
        navigation: navigation,
        progress: {
          total_modules: totalModules,
          completed_modules: completedModules,
          progress_percent: progressPercent,
          modules_list: classModules
        }
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
