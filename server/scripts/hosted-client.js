const { Client } = require("pg");

const { env } = require("../src/config/env");

function createHostedClient() {
  if (env.DB_CLIENT !== "postgres") {
    throw new Error("Hosted scripts target PostgreSQL; set DB_CLIENT=postgres or DATABASE_URL");
  }
  return new Client({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ...(env.DB_SSL ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

module.exports = { createHostedClient };
