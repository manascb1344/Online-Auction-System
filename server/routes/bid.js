// routes/api.js
const express = require("express");
const router = express.Router();
const connection = require("../config/db");

// Middleware to parse JSON bodies
router.use(express.json());

// Route for placing a bid
router.post("/", async (req, res) => {
	const { itemName, amount, last_bidder } = req.body;

	try {
		// Update the database with the new bid
		await connection
			.promise()
			.query(
				"UPDATE items SET Last_Bidder = ?, Last_Bid = ? WHERE Item_Name = ?",
				[last_bidder, amount, itemName]
			);

		// Send a success response
		res.status(200).json({ message: "Bid placed successfully" });
	} catch (error) {
		console.error("Error placing bid:", error);

		// Send debug information along with the error response
		res
			.status(500)
			.json({
				error: "Internal Server Error",
				debug: error.message,
			});
	}
});

module.exports = router;
