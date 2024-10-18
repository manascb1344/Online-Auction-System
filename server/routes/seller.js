// routes/seller.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    console.log("Received request to fetch seller by ID");
    const sellerId = req.params.id;
    const query = "SELECT name FROM sellers WHERE Seller_ID = $1";
    const { rows } = await pool.query(query, [sellerId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Seller not found" });
    }
    const sellerName = rows[0].name;
    console.log("Received seller name from database:", sellerName);
    res.json({ sellerName });
  })
);

module.exports = router;
