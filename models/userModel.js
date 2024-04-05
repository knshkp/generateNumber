const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
  user_id:{
    type:String,
    required:true
  },
  name: {
    type: String,
    required:true
  },
  phone: {
    type: String,
    required:true
  },
  // password: {
  //   type: String,
  //   required: true,
  // },
  email: {
    type: String,
    required:true
  },
  wallet:{
    type:Number,
    default:0
  },
  avatar:{
    type:Number
  },
  refer_id:{
    type:[Number]
  },
  withdrwarl_amount:{
    type:Number,
    default:0
  },
  referred_wallet:{
    type:Number,
    default:0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.generateToken=async function(){
  try {
    return jwt.sign(
      {
         user_id:this._id.toString(),
         email:this.email,
         phone:this.phone
      }
  );
  } catch (error) {
    console.error(error);
  }
};

module.exports = mongoose.model("User", userSchema);
