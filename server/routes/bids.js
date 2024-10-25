// routes/bids.js
const express = require("express");
const router = express.Router();
const bidsController = require("../controller/bidsController");

router.get("/", bidsController.getBids);

module.exports = router;
