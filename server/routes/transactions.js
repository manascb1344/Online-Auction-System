const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
	console.log("Received API request");
	try {
		const query = `
			SELECT transactions.*, buyers.Username AS Buyer_Name, sellers.Username AS Seller_Name 
			FROM transactions 
			JOIN buyers ON transactions.Buyer_ID = buyers.Buyer_ID 
			JOIN sellers ON transactions.Seller_ID = sellers.Seller_ID
		`;
		const { rows } = await pool.query(query);
		console.log("Received results from database:", rows);
		res.json({ items: rows });
	} catch (err) {
		console.error("Error fetching items from database:", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = router;
