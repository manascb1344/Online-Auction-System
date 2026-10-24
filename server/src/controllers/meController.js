const db = require("../db");
const bids = require("../queries/bids");
const transactions = require("../queries/transactions");
const { toBid, toTransaction } = require("../utils/serializers");

async function myBids(req, res) {
  const rows = await db.many(bids.listByBidder, { bidderId: req.user.id });
  res.json({ data: rows.map(toBid) });
}

async function myTransactions(req, res) {
  const rows = await db.many(transactions.listByBuyer, { buyerId: req.user.id });
  res.json({ data: rows.map(toTransaction) });
}

module.exports = { myBids, myTransactions };
