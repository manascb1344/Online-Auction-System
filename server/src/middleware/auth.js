const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const ApiError = require("../utils/ApiError");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(ApiError.unauthorized("Missing bearer token"));
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    req.user = { id: payload.sub, role: payload.role, username: payload.username };
    return next();
  } catch {
    return next(ApiError.unauthorized("Invalid or expired token"));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`This endpoint requires role: ${roles.join(" or ")}`));
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
