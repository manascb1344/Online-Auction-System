const crypto = require("crypto");

const db = require("../db");
const items = require("../queries/items");
const auctions = require("../queries/auctions");
const bids = require("../queries/bids");
const ApiError = require("../utils/ApiError");
const { toBid } = require("../utils/serializers");

const MIN_INCREMENT = 1;

async function listForItem(req, res) {
  const item = await db.one(items.findById, { id: req.params.id });
  if (!item) throw ApiError.notFound("Item not found");
  const rows = await db.many(bids.listForItem, { itemId: req.params.id });
  res.json({ data: rows.map(toBid) });
}

async function place(req, res) {
  const itemId = req.params.id;
  const bidderId = req.user.id;
  const amount = Math.round(req.body.amount * 100) / 100;

  const created = await db.transaction(async (tx) => {
    const auction = await tx.one(auctions.findByItemForUpdate, { itemId });
    if (!auction) throw ApiError.notFound("Auction not found for this item");

    const item = await tx.one(items.findById, { id: itemId });
    if (!item) throw ApiError.notFound("Item not found");

    const now = new Date();
    if (new Date(auction.end_time) <= now) {
      throw ApiError.conflict("This auction has already ended");
    }
    if (auction.status !== "active") {
      throw ApiError.conflict(
        auction.status === "scheduled" ? "This auction has not started yet" : "This auction is not open for bidding",
      );
    }

    const highest = await tx.one(bids.highestForItem, { itemId });
    const floor = highest
      ? Number(highest.amount) + MIN_INCREMENT
      : Math.max(Number(item.starting_price), Number(auction.reserve_price));

    if (amount < floor) {
      throw ApiError.unprocessable("Bid is below the minimum allowed amount", {
        minimum: floor,
        increment: MIN_INCREMENT,
      });
    }

    await tx.query(bids.markPreviousOutbid, { itemId });
    const bidId = crypto.randomUUID();
    await tx.query(bids.insert, { id: bidId, itemId, bidderId, amount });
    return tx.one(bids.findById, { id: bidId });
  });

  res.status(201).json({ data: toBid(created) });
}

async function listMine(req, res) {
  const rows = await db.many(bids.listByBidder, { bidderId: req.user.id });
  res.json({ data: rows.map(toBid) });
}

async function listAll(req, res) {
  const { page, limit } = req.validatedQuery;
  const rows = await db.many(bids.listAll, { limit, offset: (page - 1) * limit });
  res.json({ data: rows.map(toBid), meta: { page, limit, hasMore: rows.length === limit } });
}

module.exports = { listForItem, place, listMine, listAll };
