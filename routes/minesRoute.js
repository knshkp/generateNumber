const express = require("express");
const mines_route = express.Router(); // Use express.Router() to create a router instance
const bodyParser = require("body-parser");
mines_route.use(bodyParser.json());
mines_route.use(bodyParser.urlencoded({ extended: true }));
const minesController=require('../controllers/minesController.js');
mines_route.get('/getMines', minesController.getMatrix);
mines_route.post('/sendMinesMoney', minesController.sendMinesMoney);
mines_route.post('/receiveMinesMoney', minesController.receiveMinesMoney);
mines_route.get(`/getReward`,minesController.getReward)
module.exports = mines_route;
