const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = `
			SELECT items.*, 
				   sellers.Username AS Seller_Username, 
				   sellers.Email AS Seller_Email, 
				   sellers.Address AS Seller_Address, 
				   sellers.Account_Balance AS Seller_Account_Balance, 
				   auctions.Auction_Status 
			FROM items 
			JOIN sellers ON items.Seller_ID = sellers.Seller_ID 
			JOIN auctions ON items.Item_ID = auctions.Item_ID;
		`;
    const { rows } = await pool.query(query);
    // console.log("Received results from database:", rows);
    res.json({ items: rows });
  })
);

module.exports = router;
