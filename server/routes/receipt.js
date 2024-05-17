
const express = require('express');
const router = express.Router();
const connection = require("../config/db");


app.get('/api/buyers/:id', async (req, res) => {
  const buyerId = req.params.id;

  try {
    const buyer = await pool.query('SELECT * FROM Buyers WHERE Buyer_ID = ?', [buyerId]);
    res.json(buyer[0]);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch transactions by buyer ID
app.get('/api/transactions', async (req, res) => {
  const buyerId = req.query.buyer_id;

  try {
    const transactions = await pool.query('SELECT * FROM Transactions WHERE Buyer_ID = ?', [buyerId]);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

