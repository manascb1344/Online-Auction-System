const express = require("express");
const router = express.Router();
const auctionController = require("../controller/auctionController");

router.get("/", auctionController.getAuctions);

module.exports = router;
