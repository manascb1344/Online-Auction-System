const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.get("/", (req, res) => {
	console.log("Received API request");
	connection.query(
		"SELECT transactions.*, buyers.Username AS Buyer_Name, sellers.Username AS Seller_Name FROM transactions JOIN buyers ON transactions.Buyer_ID = buyers.Buyer_ID JOIN sellers ON transactions.Seller_ID = sellers.Seller_ID",
		(err, results) => {
			if (err) {
				console.error("Error fetching items from database:", err);
				res.status(500).json({ error: "Internal Server Error" });
			} else {
				console.log("Received results from database:", results);
				res.json({ items: results });
			}
		}
	);
});

module.exports = router;
