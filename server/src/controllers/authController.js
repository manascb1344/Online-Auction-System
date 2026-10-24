const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../db");
const queries = require("../queries/auth");
const { env } = require("../config/env");
const ApiError = require("../utils/ApiError");
const { toUser } = require("../utils/serializers");

// Compared against when the username does not exist, so a failed login takes
// the same time whether or not the account is real.
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8f9hM7GvJI3sY4bWq0LhN0h1p3C9e6";

const lookup = {
  buyer: { byUsername: queries.findBuyerByUsername, byId: queries.findBuyerById, insert: queries.insertBuyer },
  seller: { byUsername: queries.findSellerByUsername, byId: queries.findSellerById, insert: queries.insertSeller },
  admin: { byUsername: queries.findAdminByUsername, byId: queries.findAdminById },
};

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, username: user.username },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
}

async function register(req, res) {
  const { role, username, password, email, address = null } = req.body;

  const existing = await db.many(queries.existingRoles, { username });
  if (existing.length > 0) {
    throw ApiError.conflict("That username is already registered");
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  await db.query(lookup[role].insert, { id, username, passwordHash, email, address });

  const row = await db.one(lookup[role].byId, { id });
  res.status(201).json({
    data: { user: toUser(row, role), token: signToken({ id, role, username }) },
  });
}

async function login(req, res) {
  const { role, username, password } = req.body;
  const row = await db.one(lookup[role].byUsername, { username });

  if (!row) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw ApiError.unauthorized("Invalid username or password");
  }

  const matches = await bcrypt.compare(password, row.password_hash);
  if (!matches) throw ApiError.unauthorized("Invalid username or password");

  const user = toUser(row, role);
  res.json({ data: { user, token: signToken({ id: row.id, role, username: row.username }) } });
}

async function me(req, res) {
  const row = await db.one(lookup[req.user.role].byId, { id: req.user.id });
  if (!row) throw ApiError.notFound("Account no longer exists");
  res.json({ data: { user: toUser(row, req.user.role) } });
}

module.exports = { register, login, me };
