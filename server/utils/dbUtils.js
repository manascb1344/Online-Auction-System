// /utils/dbUtils.js
const pool = require("../config/db");

const getBuyerById = async (buyerId) => {
  const query = "SELECT * FROM Buyers WHERE Buyer_ID = $1";
  const { rows } = await pool.query(query, [buyerId]);
  return rows.length > 0 ? rows[0] : null;
};

const getTransactionsByBuyerId = async (buyerId) => {
  const query = "SELECT * FROM Transactions WHERE Buyer_ID = $1";
  const { rows } = await pool.query(query, [buyerId]);
  return rows;
};

module.exports = {
  getBuyerById,
  getTransactionsByBuyerId,
};
