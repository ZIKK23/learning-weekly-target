const { Pool, types } = require('pg');

// pg parses DATE as a JS Date (shifts by timezone on serialize) — keep it a plain 'YYYY-MM-DD' string like mysql2 did.
types.setTypeParser(1082, val => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function toPgSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function isSelect(sql) {
  return /^\s*(SELECT|WITH)\b/i.test(sql);
}

function isInsert(sql) {
  return /^\s*INSERT\b/i.test(sql);
}

// mysql2-compatible wrapper: query() returns [rows] for SELECT, [{ insertId, affectedRows }] otherwise.
async function run(executor, sql, params = []) {
  const insert = isInsert(sql);
  const pgSql = insert && !/\bRETURNING\b/i.test(sql) ? `${sql} RETURNING id` : sql;
  const result = await executor.query(toPgSql(pgSql), params);

  if (isSelect(sql)) return [result.rows];
  if (insert) return [{ insertId: result.rows[0]?.id, affectedRows: result.rowCount }];
  return [{ affectedRows: result.rowCount }];
}

module.exports = {
  query: (sql, params) => run(pool, sql, params),
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: (sql, params) => run(client, sql, params),
      beginTransaction: () => client.query('BEGIN'),
      commit: () => client.query('COMMIT'),
      rollback: () => client.query('ROLLBACK'),
      release: () => client.release()
    };
  }
};
