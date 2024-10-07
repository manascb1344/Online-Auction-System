const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
	// console.log("Received API request");
	try {
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
	} catch (err) {
		console.error("Error fetching items from database:", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = router;
