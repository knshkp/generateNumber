const User = require("../models/userModel");
const userLogin = async (req, res) => {
    try {
      const phone = req.body.phone;
      const userData = await User.findOne({ phone: phone });
  
      if (userData) {
        // User exists, send user details
        const userResult = {
          _id: userData._id,
          name: userData.name,
          phone: userData.phone,
          email:userData.email
        };
  
        const response = {
          success: true,
          msg: "UserDetail",
          data: userResult,
        };
        res.status(200).send(response);
      } else {
        // User does not exist, signup the user
        const newUser = new User({
          phone: phone,
          email:req.body.email,
          name:req.body.name
          // Add any other required fields for signup
        });
  
        const savedUser = await newUser.save();
        const userResult = {
          _id: savedUser._id,
          name: savedUser.name,
          phone: savedUser.phone,
          email:savedUser.email
        };
  
        const response = {
          success: true,
          msg: "User created successfully",
          data: userResult,
        };
        res.status(200).send(response);
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  module.exports=userLogin;