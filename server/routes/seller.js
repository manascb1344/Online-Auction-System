// routes/seller.js
const express = require("express");
const router = express.Router();
const sellerController = require("../controller/sellerController");

router.get("/:id", sellerController.getSeller);

module.exports = router;
