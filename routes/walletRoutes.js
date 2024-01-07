const express = require("express");
const user_route = express.Router(); // Use express.Router() to create a router instance
const bodyParser = require("body-parser");
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));
const walletController = require('../controllers/walletController');

user_route.post('/deposit', walletController.depositFunds);
user_route.post('/withdraw', walletController.withdrawFunds);
user_route.get('/getWallet',walletController.getWallet)
user_route.get('/getTrans',walletController.getWalletTrans)
user_route.post('/updateStatus', walletController.updateStatus);

module.exports = user_route;
