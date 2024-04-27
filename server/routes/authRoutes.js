const express = require("express");
const router = express.Router();
const connection = require("../config/db");

// Middleware to parse JSON bodies
router.use(express.json());

// Route for user login
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

		// Query the database for the user
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

				// Check if user exists
				if (results.length === 0) {
					return res
						.status(404)
						.json({ auth: false, message: "User not found" });
				}

				const user = results[0];

				// Check password directly
				const isAuthenticated = password === user.Password;

				// Return authentication status
				res.json({ auth: isAuthenticated });
			}
		);
	} catch (error) {
		console.error(error);
		res.status(500).json({ auth: false, message: "Server error" });
	}
});

module.exports = router;
