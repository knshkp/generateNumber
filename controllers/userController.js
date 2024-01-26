const User = require("../models/userModel");
const Ref=require("../models/referModel")
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
          avatar:userData.avatar,
          user_id:userData.user_id,
          refer_id:userData.refer_id,
          withdrwarl_amount:userData.withdrwarl_amount
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
          var min = 100000; // Minimum 6-digit number
          var max = 999999; // Maximum 6-digit numbers

        let userID=await generateUniqueUserID()
        const referId = req.body.referId;
        console.log(`>>>>>>>`,req.body)
        if(referId){
        const referedUser = await User.findOne({ user_id: referId });
        cons
        
        if (referedUser) {
          // Check if referId is not already in the array
          if (!referedUser.refer_id.includes(userID)) {
            referedUser.refer_id.push(userID);
        
            // Save the updated user
            await referedUser.save();
        
            console.log(`Added ${referId} to the refer_id array of user with user_id: ${referedUser.user_id}`);
          }
        }
      }
          console.log(`>>>>>>>>>>>`,userID)
          const newUser = new User({
            phone: phone,
            email:req.body.email,
            name:req.body.name,
            avatar:req.body.avatar,
            user_id:userID,
            withdrwarl_amount:0
            // Add any other required fields for signup
          });
    
          const savedUser = await newUser.save();
          const userResult = {
            _id: savedUser._id,
            name: savedUser.name,
            phone: savedUser.phone,
            email:savedUser.email,
            avatar:savedUser.avatar,
            user_id:savedUser.user_id,
            withdrwarl_amount:savedUser.withdrwarl_amount
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
  async function generateUniqueUserID() {
    while (true) {
      var userID = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  
      // Check if the generated user ID already exists
      const existingUser = await User.findOne({ user_id: userID });
  
      if (!existingUser) {
        // If the user ID is unique, return it
        return userID;
      }
      // If the user ID already exists, generate a new one in the next iteration
    }
  }
  
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