const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.get("/", (req, res) => {
	console.log("Received API request");
	connection.query(
		"SELECT bids.*, buyers.Username AS Bidder_Name, items.Item_Name as Item FROM bids JOIN buyers ON bids.Bidder_ID = buyers.Buyer_ID JOIN items ON bids.Item_ID = items.Item_ID",
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
