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

	const currentTime = new Date();

	pool.query(
		"SELECT MAX(Item_ID) AS maxItemID FROM Items",
		(error, resultsItem) => {
			if (error) {
				console.error("Error retrieving max item ID:", error);
				return res.status(500).json({ error: "Failed to add product" });
			}

			let maxItemID = 0;
			if (resultsItem.length > 0) {
				maxItemID = resultsItem[0].maxItemID || 0;
			}
			const itemID = maxItemID + 1;

			let auctionStatus = "";
			if (currentTime < new Date(auctionEndTime)) {
				auctionStatus = "Pending";
			} else if (currentTime >= new Date(auctionEndTime)) {
				auctionStatus = "Closed";
			} else {
				auctionStatus = "Active";
			}

			pool.query(
				"INSERT INTO Items (Seller_ID, Item_ID, Item_Name, Description, Starting_Price, Auction_End_Time, Category, Last_Bidder, Last_Bid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
				[
					sellerID,
					itemID,
					itemName,
					description,
					startingPrice,
					auctionEndTime,
					category,
					null,
					startingPrice,
				],
				(error, results) => {
					if (error) {
						console.error("Error adding product:", error);
						return res.status(500).json({ error: "Failed to add product" });
					}

					pool.query(
						"SELECT MAX(Auction_ID) AS maxAuctionID FROM Auctions",
						(error, resultsAuction) => {
							if (error) {
								console.error("Error retrieving max auction ID:", error);
								return res.status(500).json({ error: "Failed to add product" });
							}

							let maxAuctionID = 0;
							if (resultsAuction.length > 0) {
								maxAuctionID = resultsAuction[0].maxAuctionID || 0;
							}
							const auctionID = maxAuctionID + 1;

							pool.query(
								"INSERT INTO Auctions (Auction_ID, Item_ID, Auction_Start_Time, Auction_End_Time, Auction_Status, Reserve_Price) VALUES (?, ?, ?, ?, ?, ?)",
								[
									auctionID,
									itemID,
									new Date(),
									auctionEndTime,
									auctionStatus,
									startingPrice,
								],
								(error, results) => {
									if (error) {
										console.error("Error adding auction:", error);
										return res.status(500).json({ error: "Failed to add product" });
									}
									return res.status(200).json({ message: "Product added successfully" });
								}
							);
						}
					);
				}
			);
		}
	);
});

module.exports = router;
