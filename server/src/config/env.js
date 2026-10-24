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
env.DB_PORT = env.DB_PORT ?? (env.DB_CLIENT === "postgres" ? 5432 : 3306);

if (env.NODE_ENV === "production" && env.JWT_SECRET === DEV_JWT_SECRET) {
  throw new Error("JWT_SECRET must be set to a unique value in production");
}

module.exports = {
  env,
  isProd: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
};
