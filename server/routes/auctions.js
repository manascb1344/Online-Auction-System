const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.get("/", (req, res) => {
	console.log("Received API request");
	connection.query(
		"SELECT auctions.*, items.Item_Name AS Item_Name, items.Description as Description FROM auctions JOIN items ON auctions.Item_ID = items.Item_ID",
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
