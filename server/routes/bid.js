const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.use(express.json());

router.post("/", async (req, res) => {
	const { itemName, amount, last_bidder } = req.body;

	try {
		await connection
			.promise()
			.query(
				"UPDATE items SET Last_Bidder = ?, Last_Bid = ? WHERE Item_Name = ?",
				[last_bidder, amount, itemName]
			);

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
