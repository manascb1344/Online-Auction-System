// routes/api.js
const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.get("/", (req, res) => {
	console.log("Received API request");
	connection.query(
		"SELECT items.*, sellers.Username AS Seller_Username, sellers.Email AS Seller_Email, sellers.Address AS Seller_Address, sellers.Account_Balance AS Seller_Account_Balance FROM items JOIN sellers ON items.Seller_ID = sellers.Seller_ID",
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
