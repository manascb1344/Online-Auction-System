	// routes/buyers.js
	const express = require('express');
	const router = express.Router();
	const connection = require("../config/db");
	const queries = require("./sqlQueries");

	router.get('/buyers/:id', async (req, res) => {
		const buyerId = req.params.id;

		try {
			connection.query(queries.SELECT_BUYER_BY_ID, [buyerId], (error, results) => {
				if (error) {
					console.error('Error fetching buyer:', error);
					res.status(500).json({ error: 'Internal server error' });
				} else {
					res.json(results[0]);
				}
			});
		} catch (error) {
			console.error('Error fetching buyer:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});

	router.get('/transactions', async (req, res) => {
		const buyerId = req.query.buyer_id;

		try {
			connection.query(queries.SELECT_TRANSACTIONS_BY_BUYER, [buyerId], (error, results) => {
				if (error) {
					console.error('Error fetching transactions:', error);
					res.status(500).json({ error: 'Internal server error' });
				} else {
					res.json(results);
				}
			});
		} catch (error) {
			console.error('Error fetching transactions:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});

	module.exports = router;
