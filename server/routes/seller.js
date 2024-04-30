const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.get("/:id", (req, res) => {
	console.log("Received request to fetch seller by ID");
	const sellerId = req.params.id;
	connection.query(
		"SELECT name FROM sellers WHERE Seller_ID = ?",
		[sellerId],
		(err, results) => {
			if (err) {
				console.error("Error fetching seller from database:", err);
				res.status(500).json({ error: "Internal Server Error" });
			} else {
				if (results.length === 0) {
					res.status(404).json({ error: "Seller not found" });
				} else {
					const sellerName = results[0].name;
					console.log(
						"Received seller name from database:",
						sellerName
					);
					res.json({ sellerName });
				}
			}
		}
	);
});

module.exports = router;
