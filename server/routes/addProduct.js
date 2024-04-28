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
		sellerID,
	} = req.body;

	// Retrieve the last item ID from the database
	pool.query(
		"SELECT Item_ID FROM Items ORDER BY Item_ID DESC LIMIT 1",
		(error, results) => {
			if (error) {
				console.error("Error retrieving last item ID:", error);
				return res
					.status(500)
					.json({ error: "Failed to add product" });
			}

			let lastItemId = 0; // Default to 0 if there are no existing rows
			if (results.length > 0) {
				lastItemId = results[0].Item_ID;
			}

			// Increment the last item ID by one to generate the new item ID
			const itemId = lastItemId + 1;

			// Set default values for last bidder and last bid
			const lastBidder = null;
			const lastBid = startingPrice;

			// Insert the new product into the database
			pool.query(
				"INSERT INTO Items (Seller_ID, Item_ID, Item_Name, Description, Starting_Price, Auction_End_Time, Category, Last_Bidder, Last_Bid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
				[
					sellerID,
					itemId,
					itemName,
					description,
					startingPrice,
					auctionEndTime,
					category,
					lastBidder,
					startingPrice, // Include the lastBid value here
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
