const mysql = require("mysql2/promise");

function create(env) {
  const pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
    namedPlaceholders: false,
    timezone: "Z",
  });

  const run = async (target, text, values) => {
    const [result] = values.length
      ? await target.execute(text, values)
      : await target.query(text);
    if (Array.isArray(result)) {
      return { rows: result, rowCount: result.length };
    }
    return { rows: [], rowCount: result.affectedRows ?? 0 };
  };

  return {
    dialect: "mysql",
    query: (text, values = []) => run(pool, text, values),
    async transaction(fn) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const result = await fn({ query: (text, values = []) => run(connection, text, values) });
        await connection.commit();
        return result;
      } catch (error) {
        try {
          await connection.rollback();
        } catch {
          // rollback failure must not mask the original error
        }
        throw error;
      } finally {
        connection.release();
      }
    },
    async ping() {
      await pool.query("SELECT 1");
    },
    close: () => pool.end(),
  };
}

module.exports = { create };
