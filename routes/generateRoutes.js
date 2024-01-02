const express = require('express');
const router = express.Router();
const numberController = require('../controllers/generateController');

module.exports = (io) => {
  router.get('/currentData', (req, res) => {
    numberController.generateAndBroadcastNumber(io);
    res.send('Generate route');
  });

  return router;
};
