const express = require("express");
const router = express.Router();
const {
  getBuyerById,
  getTransactionsByBuyerId,
} = require("../utils/dbHelpers");
const asyncHandler = require("../utils/asyncHandler");

router.get(
  "/api/buyers/:id",
  asyncHandler(async (req, res) => {
    const buyerId = req.params.id;
    const buyer = await getBuyerById(buyerId);
    if (!buyer) {
      return res.status(404).json({ error: "Buyer not found" });
    }
    res.json(buyer);
  })
);

router.get(
  "/api/transactions",
  asyncHandler(async (req, res) => {
    const buyerId = req.query.buyer_id;
    const transactions = await getTransactionsByBuyerId(buyerId);
    res.json(transactions);
  })
);

module.exports = router;
