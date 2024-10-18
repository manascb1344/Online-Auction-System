const express = require("express");
const router = express.Router();
const pool = require("../config/db.js");

router.use(express.json());

router.get(
  "/",
  asyncHandler(async (req, res) => {
    console.log("Received authentication request");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    const { username, password, userType } = req.body;
    console.log(
      `Attempting to authenticate user: ${username}, type: ${userType}`
    );

    let tableName;
    if (userType === "buyer") {
      tableName = "buyers";
    } else if (userType === "seller") {
      tableName = "sellers";
    } else if (userType === "admin") {
      tableName = "admin";
    } else {
      console.log(`Invalid user type: ${userType}`);
      return res.status(400).json({ message: "Invalid user type" });
    }

    console.log(`Using table: ${tableName}`);

    // Use parameterized query syntax for PostgreSQL
    const query = `SELECT * FROM ${tableName} WHERE username = $1`;
    const values = [username];

    console.log(`Executing query: ${query}`);
    // Execute the query using pool
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      console.log(`User not found: ${username}`);
      return res.status(404).json({ auth: false, message: "User not found" });
    }

    const user = result.rows[0];
    console.log(`User found: ${JSON.stringify(user)}`);

    // Password comparison logic
    const isAuthenticated = password === user.password;
    console.log(`Authentication result: ${isAuthenticated}`);

    res.json({
      auth: isAuthenticated,
      buyerID: user.buyer_id,
      sellerID: user.seller_id,
      adminID: user.admin_id,
    });
    console.log("Authentication response sent");
  }),
  "Failed to authenticate user"
);

module.exports = router;
