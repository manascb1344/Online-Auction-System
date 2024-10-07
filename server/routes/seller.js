const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:id", async (req, res) => {
	console.log("Received request to fetch seller by ID");
	const sellerId = req.params.id;
	try {
		const query = "SELECT name FROM sellers WHERE Seller_ID = $1";
		const { rows } = await pool.query(query, [sellerId]);
		if (rows.length === 0) {
			res.status(404).json({ error: "Seller not found" });
		} else {
			const sellerName = rows[0].name;
			console.log(
				"Received seller name from database:",
				sellerName
			);
			res.json({ sellerName });
		}
	} catch (err) {
		console.error("Error fetching seller from database:", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = router;
