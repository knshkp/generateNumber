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
          email:userData.email,
          wallet:userData.wallet,
          avatar:userData.avatar
        };
  
        const response = {
          success: true,
          msg: "UserDetail",
          data: userResult,
        };
        res.status(200).send(response);
      } 
      else {
        // User does not exist, signup the user
        if(!req.body.email&&!req.body.name){
          return res.status(400).send({ success: false, msg: "user not found" });
        }
        else{
          const newUser = new User({
            phone: phone,
            email:req.body.email,
            name:req.body.name,
            avatar:req.body.avatar
            // Add any other required fields for signup
          });
    
          const savedUser = await newUser.save();
          const userResult = {
            _id: savedUser._id,
            name: savedUser.name,
            phone: savedUser.phone,
            email:savedUser.email,
            avatar:savedUser.avatar,
          };
    
          const response = {
            success: true,
            msg: "User created successfully",
            data: userResult,
          };
          res.status(200).send(response);
        }
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  const updateProfile=async (req,res)=>{
    const phone = req.body.phone;
    const existingUser = await User.findOne({ phone: phone });

    if (existingUser) {
      // User exists, update user details
      existingUser.name = req.body.name || existingUser.name;
      existingUser.email = req.body.email || existingUser.email;
      existingUser.avatar = req.body.avatar || existingUser.avatar;

      const updatedUser = await existingUser.save();

      const userResult = {
        _id: updatedUser._id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        wallet: updatedUser.wallet,
        avatar: updatedUser.avatar,
      };

      const response = {
        success: true,
        msg: "User details updated successfully",
        data: userResult,
      };

      res.status(200).send(response);
    }
  }
  module.exports={userLogin,updateProfile};