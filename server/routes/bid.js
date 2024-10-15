const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.use(express.json());

router.post("/", async (req, res) => {
	const { itemName, amount, last_bidder } = req.body;
	console.log(itemName, amount, last_bidder);

	try {
		// Convert amount to a float
		const bidAmount = parseFloat(amount);

		// Check if the conversion was successful
		if (isNaN(bidAmount)) {
			throw new Error("Invalid bid amount");
		}

		// Get buyer_id from buyers table
		const buyerQuery = "SELECT buyer_id FROM buyers WHERE username = $1";
		const buyerResult = await pool.query(buyerQuery, [last_bidder]);

		if (buyerResult.rows.length === 0) {
			throw new Error("Buyer not found");
		}

		const buyer_id = buyerResult.rows[0].buyer_id;

		const query = "UPDATE items SET Last_Bidder = $1, Last_Bid = $2 WHERE Item_Name = $3";
		
		const values = [buyer_id, bidAmount, itemName];

		await pool.query(query, values);

		res.status(200).json({ message: "Bid placed successfully" });
	} catch (error) {
		console.error("Error placing bid:", error);

		if (error.message === "Invalid bid amount") {
			res.status(400).json({
				error: "Bad Request",
				message: "Invalid bid amount provided",
			});
		} else if (error.message === "Buyer not found") {
			res.status(404).json({
				error: "Not Found",
				message: "Buyer not found",
			});
		} else if (error.code === '22P02') {
			res.status(400).json({
				error: "Bad Request",
				message: "Invalid input syntax for bid amount",
			});
		} else {
			res.status(500).json({
				error: "Internal Server Error",
				debug: error.message,
			});
		}
	}
});

module.exports = router;
