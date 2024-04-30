const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.use(express.json());

router.post("/", async (req, res) => {
	const { username, password, userType } = req.body;

	try {
		let tableName;
		if (userType === "buyer") {
			tableName = "buyers";
		} else if (userType === "seller") {
			tableName = "sellers";
		} else {
			return res.status(400).json({ message: "Invalid user type" });
		}

		connection.query(
			`SELECT * FROM ${tableName} WHERE Username = ?`,
			[username],
			async (error, results) => {
				if (error) {
					console.error(error);
					return res
						.status(500)
						.json({ auth: false, message: "Server error" });
				}

				if (results.length === 0) {
					return res
						.status(404)
						.json({ auth: false, message: "User not found" });
				}

				const user = results[0];

				const isAuthenticated = password === user.Password;

				res.json({
					auth: isAuthenticated,
					buyerID: user.Buyer_ID,
					sellerID: user.Seller_ID,
				});
			}
		);
	} catch (error) {
		console.error(error);
		res.status(500).json({ auth: false, message: "Server error" });
	}
});

module.exports = router;
