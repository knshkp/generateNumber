const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
  }
});

module.exports = mongoose.model("User", userSchema);
