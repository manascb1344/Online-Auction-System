const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

module.exports = {
  getProductBySeller: asyncHandler(async (req, res) => {
    const { sellerId } = req.params;
    const query = `
      SELECT * FROM items
      WHERE seller_id = $1
    `;
    const { rows } = await pool.query(query, [sellerId]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Seller not found or has no products" });
    }
    return res.json(rows);
  }, "Error fetching products by seller ID"),
};
