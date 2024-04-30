const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.post("/", (req, res) => {
	const {
		itemName,
		description,
		startingPrice,
		auctionEndTime,
		category,
		sellerID,
	} = req.body;

	pool.query(
		"SELECT Item_ID FROM Items ORDER BY Item_ID DESC LIMIT 1",
		(error, results) => {
			if (error) {
				console.error("Error retrieving last item ID:", error);
				return res
					.status(500)
					.json({ error: "Failed to add product" });
			}

			let lastItemId = 0;
			if (results.length > 0) {
				lastItemId = results[0].Item_ID;
			}
			const itemId = lastItemId + 1;

			const lastBidder = null;
			const lastBid = startingPrice;

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
					startingPrice,
				],
				(error, results) => {
					if (error) {
						console.error("Error adding product:", error);
						return res
							.status(500)
							.json({ error: "Failed to add product" });
					}
					return res
						.status(200)
						.json({ message: "Product added successfully" });
				}
			);
		}
	);
});

module.exports = router;
