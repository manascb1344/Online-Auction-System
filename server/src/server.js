const { createApp } = require("./app");
const { env } = require("./config/env");
const db = require("./db");

async function main() {
  await db.ping();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[api] listening on :${env.PORT} (${db.dialect})`);
  });

  const shutdown = (signal) => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(async () => {
      await db.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error("[api] failed to start:", error.message);
  process.exit(1);
});
