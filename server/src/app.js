const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { env } = require("./config/env");
const db = require("./db");
const asyncHandler = require("./utils/asyncHandler");
const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errors");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()),
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  app.get(
    "/health",
    asyncHandler(async (req, res) => {
      await db.ping();
      res.json({ status: "ok", dialect: db.dialect });
    }),
  );

  app.use("/api", apiRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
