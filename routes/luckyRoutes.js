// generateRoutes.js
const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const { generateAndBroadcastNumber, sendLuckyMoney ,receiveMoney,getLuckyTransactions} = require('../controllers/luckyWheelController');

module.exports = (io) => {
  // Route to trigger number generation and broadcast
  router.get('/currentLucky', (req, res) => {
    generateAndBroadcastNumber(io);
    res.send('Generate Lucky route');
  });
  router.get('/getLuckyTrans',getLuckyTransactions)
  // Route to handle sending money
  router.post('/sendLuckyMoney', async (req, res) => {
    const { phone, color, amount,avatar } = req.body;

    try {
      await sendLuckyMoney(io, phone,color, amount);
      res.status(200).json({ message: 'Money sent successfully' });
    } catch (error) {
      console.error('Error sending money:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  router.post('/receiveMoney', async (req, res) => {
    const { phone, color, amount } = req.body;

    try {
      await receiveMoney(io, phone,color, amount);
      res.status(200).json({ message: 'Money sent successfully' });
    } catch (error) {
      console.error('Error sending money:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  return router;
};
