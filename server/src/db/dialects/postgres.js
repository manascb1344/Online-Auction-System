const { Pool, types } = require("pg");

// Return NUMERIC and BIGINT as JS numbers so both dialects serialize identically.
types.setTypeParser(1700, (value) => (value === null ? null : Number(value)));
types.setTypeParser(20, (value) => (value === null ? null : Number(value)));

function create(env) {
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    max: 10,
  });

  const run = async (target, text, values) => {
    const result = await target.query(text, values);
    return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
  };

  return {
    dialect: "postgres",
    query: (text, values = []) => run(pool, text, values),
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await fn({ query: (text, values = []) => run(client, text, values) });
        await client.query("COMMIT");
        return result;
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // rollback failure must not mask the original error
        }
        throw error;
      } finally {
        client.release();
      }
    },
    async ping() {
      await pool.query("SELECT 1");
    },
    close: () => pool.end(),
  };
}

module.exports = { create };
