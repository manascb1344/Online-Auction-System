
const express = require('express');
const router = express.Router();
const connection = require("../config/db");

// Route to fetch buyer profile by ID
router.get('/profile/:id', (req, res) => {
	const buyerId = req.params.id;

	// Assuming 'buyers' is the name of your table
	const sql = `SELECT * FROM buyers WHERE Buyer_ID = ?`;

	connection.query(sql, [buyerId], (error, results) => {
		if (error) {
			console.error('Error fetching buyer profile:', error);
			res.status(500).json({ error: 'Internal server error' });
		} else {
			if (results.length > 0) {
				const buyerProfile = results[0];
				res.json(buyerProfile);
			} else {
				res.status(404).json({ error: 'Buyer profile not found' });
			}
		}
	});
});

module.exports = router;
