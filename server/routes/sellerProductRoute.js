// productsBySeller.js

const express = require("express");
const router = express.Router();
const connection = require("../config/db");

// API endpoint to get all products of a seller
router.get("/:sellerId", (req, res) => {
	const { sellerId } = req.params;

	// SQL query to retrieve products of a seller based on seller ID
	const query = `
    SELECT * FROM items
    WHERE seller_id = ?
  `;

	connection.query(query, [sellerId], (err, results) => {
		if (err) {
			console.error("Error:", err);
			return res
				.status(500)
				.json({ error: "Internal server error" });
		}

		if (results.length === 0) {
			return res
				.status(404)
				.json({ error: "Seller not found or has no products" });
		}

		return res.json(results);
	});
});

module.exports = router;
