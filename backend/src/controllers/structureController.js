const db = require('../config/db');

// Original function - Add new class and modules structure
exports.addStructure = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { class_name, modules } = req.body;

    if (!class_name || !modules || !Array.isArray(modules)) {
      return res.status(400).json({
        status: "error",
        message: "class_name dan modules wajib diisi"
      });
    }

    await conn.beginTransaction();

    const [existingClass] = await conn.query(
      "SELECT id FROM classes WHERE name = ?",
      [class_name]
    );

    let classId;

    if (existingClass.length > 0) {
      classId = existingClass[0].id;
    } else {
      const [classResult] = await conn.query(
        "INSERT INTO classes (name) VALUES (?)",
        [class_name]
      );
      classId = classResult.insertId;
    }

    for (const mod of modules) {
      const [moduleResult] = await conn.query(
        `INSERT INTO modules (class_id, name, est_minutes, description)
         VALUES (?, ?, ?, ?)`,
        [classId, mod.name, mod.est_minutes || 0, mod.description || null]
      );

      const moduleId = moduleResult.insertId;

      if (mod.submodules && Array.isArray(mod.submodules)) {
        for (const sub of mod.submodules) {
          await conn.query(
            `INSERT INTO submodules (module_id, title, content)
             VALUES (?, ?, ?)`,
            [
              moduleId,
              sub.title,
              sub.content || null
            ]
          );
        }
      }
    }

    await conn.commit();

    res.json({
      status: "ok",
      message: "Modul & submodul berhasil ditambahkan ke kelas",
      class_id: classId
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
};

// Get available modules (all incomplete modules for classes user is enrolled in)
exports.getAvailableModules = async (req, res) => {
  try {
    const user_id = req.user.id;

    // 1. Get IDs of classes the user is enrolled in (has at least one target)
    const [enrolledClasses] = await db.query(`
      SELECT DISTINCT m.class_id
      FROM targets t
      JOIN target_modules tm ON tm.target_id = t.id
      JOIN modules m ON m.id = tm.module_id
      WHERE t.user_id = ?
    `, [user_id]);

    if (enrolledClasses.length === 0) {
      return res.json({ status: 'ok', data: [] });
    }

    const classIds = enrolledClasses.map(c => c.class_id);

    // 2. Get ALL modules for these classes that are NOT completed
    const [availableModules] = await db.query(`
      SELECT 
        c.id as class_id,
        c.name as class_name,
        m.id as module_id,
        m.name as module_name,
        m.est_minutes,
        m.description
      FROM modules m
      JOIN classes c ON c.id = m.class_id
      WHERE m.class_id IN (?)
        AND m.id NOT IN (
          SELECT DISTINCT tm.module_id
          FROM target_modules tm
          JOIN targets t ON t.id = tm.target_id
          WHERE t.user_id = ? AND tm.status = 'completed'
        )
      ORDER BY c.id, m.id
    `, [classIds, user_id]);

    // Group by class
    const groupedData = {};
    
    availableModules.forEach(row => {
      if (!groupedData[row.class_id]) {
        groupedData[row.class_id] = {
          class_id: row.class_id,
          class_name: row.class_name,
          modules: []
        };
      }
      
      groupedData[row.class_id].modules.push({
        module_id: row.module_id,
        module_name: row.module_name,
        est_minutes: row.est_minutes,
        description: row.description
      });
    });

    const result = Object.values(groupedData);

    res.json({
      status: 'ok',
      data: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};



