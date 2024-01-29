const express = require("express");
const user_route = express.Router(); // Use express.Router() to create a router instance
const bodyParser = require("body-parser");
const user_controller = require('../controllers/userController');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

user_route.post('/login', user_controller.userLogin);
user_route.post('/update',user_controller.updateProfile)
user_route.get('/getUser',user_controller.getUser)
module.exports = user_route;
