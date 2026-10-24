const path = require("path");
const { z } = require("zod");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const DEV_JWT_SECRET = "dev-only-secret-change-me";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DB_CLIENT: z.enum(["mysql", "postgres"]).default("mysql"),
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().optional(),
  DB_USER: z.string().default("auction_user"),
  DB_PASSWORD: z.string().default("auction_password"),
  DB_NAME: z.string().default("auction_system"),
  DATABASE_URL: z.string().url().optional(),
  DB_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  JWT_SECRET: z.string().min(16).default(DEV_JWT_SECRET),
  JWT_EXPIRES_IN: z.string().default("1d"),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

const env = parsed.data;

if (env.DATABASE_URL) {
  const url = new URL(env.DATABASE_URL);
  env.DB_HOST = url.hostname;
  env.DB_PORT = Number(url.port || 5432);
  env.DB_USER = decodeURIComponent(url.username);
  env.DB_PASSWORD = decodeURIComponent(url.password);
  env.DB_NAME = url.pathname.replace(/^\//, "");
  if (!process.env.DB_CLIENT) env.DB_CLIENT = "postgres";
  if (url.searchParams.get("sslmode") === "require") env.DB_SSL = true;
}

env.DB_PORT = env.DB_PORT ?? (env.DB_CLIENT === "postgres" ? 5432 : 3306);

const PLACEHOLDER_SECRETS = new Set([
  DEV_JWT_SECRET,
  "change-me-to-a-long-random-value-32chars",
]);

if (env.NODE_ENV === "production" && (PLACEHOLDER_SECRETS.has(env.JWT_SECRET) || env.JWT_SECRET.length < 32)) {
  throw new Error("JWT_SECRET must be a unique value of at least 32 characters in production");
}

module.exports = {
  env,
  isProd: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
};
