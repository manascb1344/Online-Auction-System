const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

module.exports = {
  getTransaction: asyncHandler(async (req, res) => {
    console.log("Received API request");
    const query = `
      SELECT transactions.*, buyers.Username AS Buyer_Name, sellers.Username AS Seller_Name 
      FROM transactions 
      JOIN buyers ON transactions.Buyer_ID = buyers.Buyer_ID 
      JOIN sellers ON transactions.Seller_ID = sellers.Seller_ID
    `;
    const { rows } = await pool.query(query);
    console.log("Received results from database:", rows);
    res.json({ items: rows });
  }, "Error fetching transactions"),
};
