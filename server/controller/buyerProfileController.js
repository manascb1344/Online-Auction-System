const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

module.exports = {
  getBuyer: asyncHandler(async (req, res) => {
    const buyerId = req.params.id;
    const buyerQuery = "SELECT * FROM Buyers WHERE Buyer_ID = $1";
    const { rows } = await pool.query(buyerQuery, [buyerId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Buyer not found" });
    }
    res.json(rows[0]);
  }),
  getTransaction: asyncHandler(async (req, res) => {
    const buyerId = req.query.buyer_id;
    const transactionsQuery = "SELECT * FROM Transactions WHERE Buyer_ID = $1";
    const { rows } = await pool.query(transactionsQuery, [buyerId]);
    res.json(rows);
  }),
};
