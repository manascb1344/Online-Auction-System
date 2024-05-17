// Import required modules
const express = require('express');
const router = express.Router();
const connection = require("../config/db");

// Endpoint to fetch buyer information by ID
router.get('/buyers/:id', async (req, res) => {
  const buyerId = req.params.id;

  try {
    const buyerQuery = 'SELECT * FROM Buyers WHERE Buyer_ID = ?';
    connection.query(buyerQuery, [buyerId], (error, results) => {
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

// Endpoint to fetch transactions by buyer ID
router.get('/transactions', async (req, res) => {
  const buyerId = req.query.buyer_id;

  try {
    const transactionsQuery = 'SELECT * FROM Transactions WHERE Buyer_ID = ?';
    connection.query(transactionsQuery, [buyerId], (error, results) => {
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
