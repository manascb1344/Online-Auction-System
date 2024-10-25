// routes/sellerProductRoute.js
const express = require("express");
const router = express.Router();
const sellerProductRouteController = require("../controller/sellerProductRouteController");

router.get("/:sellerId", sellerProductRouteController.getProductBySeller);

module.exports = router;
