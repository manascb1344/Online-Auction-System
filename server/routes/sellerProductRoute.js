const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:sellerId", async (req, res) => {
	const { sellerId } = req.params;

	const query = `
    SELECT * FROM items
    WHERE seller_id = $1
  `;

	try {
		const { rows } = await pool.query(query, [sellerId]);

		if (rows.length === 0) {
			return res
				.status(404)
				.json({ error: "Seller not found or has no products" });
		}

		return res.json(rows);
	} catch (err) {
		console.error("Error:", err);
		return res
			.status(500)
			.json({ error: "Internal server error" });
	}
});

module.exports = router;
