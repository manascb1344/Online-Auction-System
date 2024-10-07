const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
	console.log("Received API request");
	try {
		const query = `
			SELECT auctions.*, items.Item_Name AS Item_Name, items.Description as Description 
			FROM auctions 
			JOIN items ON auctions.Item_ID = items.Item_ID
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
