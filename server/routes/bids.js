// routes/bids.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    console.log("Received API request");
    const query = `
      SELECT bids.*, buyers.Username AS Bidder_Name, items.Item_Name as Item 
      FROM bids 
      JOIN buyers ON bids.Bidder_ID = buyers.Buyer_ID 
      JOIN items ON bids.Item_ID = items.Item_ID
    `;
    const { rows } = await pool.query(query);
    console.log("Received results from database:", rows);
    res.json({ items: rows });
  })
);

module.exports = router;
