const crypto = require("crypto");

const db = require("../db");
const items = require("../queries/items");
const auctions = require("../queries/auctions");
const ApiError = require("../utils/ApiError");
const { toItem } = require("../utils/serializers");

function auctionStatus(startTime, endTime, now) {
  if (startTime > now) return "scheduled";
  if (endTime <= now) return "closed";
  return "active";
}

async function list(req, res) {
  const { status, search, page, limit } = req.validatedQuery;
  const params = {
    status: status ?? null,
    search: search ? `%${search.toLowerCase()}%` : null,
    limit,
    offset: (page - 1) * limit,
  };

  const rows = await db.many(items.list({ status, search }), params);
  res.json({
    data: rows.map(toItem),
    meta: { page, limit, hasMore: rows.length === limit },
  });
}

async function getById(req, res) {
  const row = await db.one(items.findById, { id: req.params.id });
  if (!row) throw ApiError.notFound("Item not found");
  res.json({ data: toItem(row) });
}

async function create(req, res) {
  const body = req.body;
  const now = new Date();
  const startTime = body.startTime ?? now;
  const endTime = body.endTime;

  if (endTime <= now) {
    throw ApiError.unprocessable("Auction end time must be in the future", { field: "endTime" });
  }

  const itemId = crypto.randomUUID();
  const auctionId = crypto.randomUUID();

  const row = await db.transaction(async (tx) => {
    await tx.query(items.insert, {
      id: itemId,
      sellerId: req.user.id,
      name: body.name,
      description: body.description ?? null,
      startingPrice: Math.round(body.startingPrice * 100) / 100,
      category: body.category ?? null,
      imageUrl: body.imageUrl ?? null,
    });
    await tx.query(auctions.insert, {
      id: auctionId,
      itemId,
      startTime,
      endTime,
      status: auctionStatus(startTime, endTime, now),
      reservePrice: Math.round(body.startingPrice * 100) / 100,
    });
    return tx.one(items.findById, { id: itemId });
  });

  res.status(201).json({ data: toItem(row) });
}

async function listBySeller(req, res) {
  const rows = await db.many(items.listBySeller, { sellerId: req.params.sellerId });
  res.json({ data: rows.map(toItem) });
}

async function listMine(req, res) {
  const rows = await db.many(items.listBySeller, { sellerId: req.user.id });
  res.json({ data: rows.map(toItem) });
}

module.exports = { list, getById, create, listBySeller, listMine };
