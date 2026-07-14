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

// Get available modules (all modules across all classes that user hasn't completed)
exports.getAvailableModules = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get ALL modules across ALL classes that are NOT completed by this user
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
      WHERE m.id NOT IN (
          -- modules where the user has completed every submodule (derived from
          -- submodule_progress, not a separately-written target_modules.status)
          SELECT s.module_id
          FROM submodules s
          JOIN submodule_progress sp ON sp.submodule_id = s.id AND sp.user_id = ?
          WHERE sp.status = 'completed'
          GROUP BY s.module_id
          HAVING COUNT(*) = (SELECT COUNT(*) FROM submodules s2 WHERE s2.module_id = s.module_id)
        )
      ORDER BY c.id, m.id
    `, [user_id]);

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



