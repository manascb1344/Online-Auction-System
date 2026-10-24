const { ZodError } = require("zod");
const ApiError = require("../utils/ApiError");
const { isProd } = require("../config/env");

function notFound(req, res) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    return res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    });
  }

  if (error && (error.code === "ER_DUP_ENTRY" || error.code === "23505")) {
    return res.status(409).json({
      error: { code: "CONFLICT", message: "A record with that unique value already exists" },
    });
  }

  if (error && error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON" },
    });
  }

  console.error("[unhandled]", error);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
      ...(isProd || !error?.message ? {} : { details: error.message }),
    },
  });
}

module.exports = { notFound, errorHandler };
