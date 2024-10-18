const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = `
			SELECT auctions.*, items.Item_Name AS Item_Name, items.Description as Description 
			FROM auctions 
			JOIN items ON auctions.Item_ID = items.Item_ID
		`;
    const { rows } = await pool.query(query);
    console.log("Received results from database:", rows);
    res.json({ items: rows });
  })
);

module.exports = router;
