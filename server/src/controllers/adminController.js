const db = require("../db");
const auctions = require("../queries/auctions");
const bids = require("../queries/bids");
const transactions = require("../queries/transactions");
const stats = require("../queries/stats");
const { toAuction, toBid, toTransaction, asNumber } = require("../utils/serializers");

async function listAuctions(req, res) {
  const rows = await db.many(auctions.listAll);
  res.json({ data: rows.map(toAuction) });
}

async function listBids(req, res) {
  const { page, limit } = req.validatedQuery;
  const rows = await db.many(bids.listAll, { limit, offset: (page - 1) * limit });
  res.json({ data: rows.map(toBid), meta: { page, limit, hasMore: rows.length === limit } });
}

async function listTransactions(req, res) {
  const rows = await db.many(transactions.listAll);
  res.json({ data: rows.map(toTransaction) });
}

async function summary(req, res) {
  const row = await db.one(stats.summary);
  res.json({
    data: {
      items: asNumber(row.items),
      activeAuctions: asNumber(row.active_auctions),
      bids: asNumber(row.bids),
      transactions: asNumber(row.transactions),
      buyers: asNumber(row.buyers),
      sellers: asNumber(row.sellers),
    },
  });
}

module.exports = { listAuctions, listBids, listTransactions, summary };
