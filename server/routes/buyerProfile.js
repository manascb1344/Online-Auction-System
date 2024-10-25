// routes/buyerProfile.js
const express = require("express");
const router = express.Router();
const buyerProfileController = require("../controller/buyerProfileController");

// Endpoint to fetch buyer information by ID
router.get("/buyers/:id", buyerProfileController.getBuyer);

// Endpoint to fetch transactions by buyer ID
router.get("/transactions", buyerProfileController.getTransaction);

module.exports = router;
