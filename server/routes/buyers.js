// routes/buyers.js
const express = require("express");
const router = express.Router();
const {
  getBuyerById,
  getTransactionsByBuyerId,
} = require("../utils/dbHelpers");
const asyncHandler = require("../utils/asyncHandler");
const { send404, sendSuccess } = require("../utils/responseHandler");

router.get(
  "/buyers/:id",
  asyncHandler(async (req, res) => {
    const buyerId = req.params.id;
    const buyer = await getBuyerById(buyerId);
    if (!buyer) {
      return send404(res, "Buyer not found");
    }
    sendSuccess(res, buyer);
  })
);

router.get(
  "/transactions",
  asyncHandler(async (req, res) => {
    const buyerId = req.query.buyer_id;
    const transactions = await getTransactionsByBuyerId(buyerId);
    sendSuccess(res, transactions);
  })
);

module.exports = router;
