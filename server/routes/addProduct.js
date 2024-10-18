const express = require("express");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      itemName,
      description,
      startingPrice,
      auctionEndTime,
      category,
      sellerID,
    } = req.body;

    const currentTime = new Date();

    const resultsItem = await pool.query(
      "SELECT MAX(Item_ID) AS max_item_id FROM Items"
    );

    let maxItemID = 0;
    if (resultsItem.rows.length > 0) {
      maxItemID = resultsItem.rows[0].max_item_id || 0;
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

    await pool.query(
      "INSERT INTO Items (Seller_ID, Item_ID, Item_Name, Description, Starting_Price, Auction_End_Time, Category, Last_Bidder, Last_Bid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
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
      ]
    );

    const resultsAuction = await pool.query(
      "SELECT MAX(Auction_ID) AS max_auction_id FROM Auctions"
    );

    let maxAuctionID = 0;
    if (resultsAuction.rows.length > 0) {
      maxAuctionID = resultsAuction.rows[0].max_auction_id || 0;
    }
    const auctionID = maxAuctionID + 1;

    await pool.query(
      "INSERT INTO Auctions (Auction_ID, Item_ID, Auction_Start_Time, Auction_End_Time, Auction_Status, Reserve_Price) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        auctionID,
        itemID,
        new Date(),
        auctionEndTime,
        auctionStatus,
        startingPrice,
      ]
    );

    sendSuccess(res, { message: "Product added successfully" });
  }, "Failed to add product") // Custom error message passed here
);

module.exports = router;
