const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// POST /api/addProduct - Add a new product
router.post("/", (req, res) => {
	const {
		itemName,
		description,
		startingPrice,
		auctionEndTime,
		category,
	} = req.body;

	// Retrieve the last seller ID from the database
	pool.query(
		"SELECT Seller_ID FROM Items ORDER BY Seller_ID DESC LIMIT 1",
		(error, results) => {
			if (error) {
				console.error("Error retrieving last seller ID:", error);
				return res
					.status(500)
					.json({ error: "Failed to add product" });
			}

			let lastSellerId = 1; // Default to 1 if there are no existing rows
			if (results.length > 0) {
				lastSellerId = results[0].Seller_ID;
			}

			// Increment the last seller ID by one to generate the new seller ID
			const sellerId = lastSellerId + 1;

			// Set default values for last bidder and last bid
			const lastBidder = null;
			const lastBid = startingPrice;

			// Insert the new product into the database
			pool.query(
				"INSERT INTO Items (Seller_ID, Item_Name, Description, Starting_Price, Auction_End_Time, Category, Last_Bidder, Last_Bid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
				[
					sellerId,
					itemName,
					description,
					startingPrice,
					auctionEndTime,
					category,
					lastBidder,
					lastBid,
				],
				(error, results) => {
					if (error) {
						console.error("Error adding product:", error);
						return res
							.status(500)
							.json({ error: "Failed to add product" });
					}
					// Return success response
					return res
						.status(200)
						.json({ message: "Product added successfully" });
				}
			);
		}
	);
});

module.exports = router;
