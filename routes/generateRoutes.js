// generateRoutes.js
const express = require('express');
const router = express.Router();
const { generateAndBroadcastNumber, sendMoney } = require('../controllers/generateController');

module.exports = (io) => {
  // Route to trigger number generation and broadcast
  router.get('/currentData', (req, res) => {
    generateAndBroadcastNumber(io);
    res.send('Generate route');
  });

  // Route to handle sending money
  router.post('/sendMoney', async (req, res) => {
    const { senderId, receiverId, amount } = req.body;

    try {
      await sendMoney(io, senderId, receiverId, amount);
      res.status(200).json({ message: 'Money sent successfully' });
    } catch (error) {
      console.error('Error sending money:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
