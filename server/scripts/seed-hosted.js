const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");

const { env } = require("../src/config/env");

const schemaDir = path.resolve(__dirname, "../../database/postgres");

async function main() {
  if (env.DB_CLIENT !== "postgres") {
    throw new Error("seed-hosted targets PostgreSQL; set DB_CLIENT=postgres or DATABASE_URL");
  }

  const client = new Client({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ...(env.DB_SSL ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  await client.connect();
  try {
    const existing = await client.query("SELECT to_regclass('public.items') AS items");
    if (existing.rows[0].items) {
      console.log("Schema already present; not re-seeding.");
    } else {
      await client.query(fs.readFileSync(path.join(schemaDir, "01_schema.sql"), "utf8"));
      await client.query(fs.readFileSync(path.join(schemaDir, "02_seed.sql"), "utf8"));
      console.log("Applied schema and demo seed.");
    }

    const counts = await client.query(`
      SELECT (SELECT count(*) FROM items)::int AS items,
             (SELECT count(*) FROM bids)::int AS bids,
             (SELECT count(*) FROM transactions)::int AS transactions,
             (SELECT count(*) FROM buyers)::int AS buyers,
             (SELECT count(*) FROM sellers)::int AS sellers,
             (SELECT count(*) FROM admins)::int AS admins
    `);
    console.log(JSON.stringify(counts.rows[0]));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("seed-hosted failed:", error.message);
  process.exit(1);
});
