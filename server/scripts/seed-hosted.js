const fs = require("node:fs");
const path = require("node:path");

const { createHostedClient } = require("./hosted-client");

const schemaDir = path.resolve(__dirname, "../../database/postgres");

async function main() {
  const client = createHostedClient();
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
