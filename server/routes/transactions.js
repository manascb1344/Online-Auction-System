// routes/transactions.js
const express = require("express");
const router = express.Router();
const transactionController = require("../controller/transactionController");

router.get("/", transactionController.getTransaction);

module.exports = router;
