const express = require('express');
const router = express.Router();
const QuoteRequest = require('../models/QuoteRequest');

// Create Quote Request
router.post('/', async (req, res) => {
  try {
    const newQuoteRequest = await QuoteRequest.create(req.body);
    res.status(201).json(newQuoteRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get All Quote Requests
router.get('/', async (req, res) => {
  try {
    const quoteRequests = await QuoteRequest.getAll();
    res.json(quoteRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get All Active Quote Requests
router.get('/active', async (req, res) => {
  try {
    const activeQuoteRequests = await QuoteRequest.getActiveQuotes();
    res.json(activeQuoteRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
