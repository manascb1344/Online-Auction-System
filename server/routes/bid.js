const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.use(express.json());

router.post("/", async (req, res) => {
	const { itemName, amount, last_bidder } = req.body;

	try {
		const query = "UPDATE items SET Last_Bidder = $1, Last_Bid = $2 WHERE Item_Name = $3";
		const values = [last_bidder, amount, itemName];

		await pool.query(query, values);

		res.status(200).json({ message: "Bid placed successfully" });
	} catch (error) {
		console.error("Error placing bid:", error);

		res.status(500).json({
			error: "Internal Server Error",
			debug: error.message,
		});
	}
});

module.exports = router;
