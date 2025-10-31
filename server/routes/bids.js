const express = require("express");
const router = express.Router();
const connection = require("../config/db");
const queries = require("./sqlQueries");

router.get("/", (req, res) => {
	console.log("Received API request");
	connection.query(queries.SELECT_BIDS_WITH_NAMES, (err, results) => {
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
