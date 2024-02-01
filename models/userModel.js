const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", userSchema);
