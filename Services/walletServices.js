// walletService.js
const User = require('../models/userModel');

const addFunds = async (phone, amount) => {
    try {
      const user = await User.findOne({ phone: phone });
      if (!user) {
        throw new Error('User not found');
      }
  
      user.wallet += amount;
      await user.save();
      return user.wallet;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  };
  

const deductFunds = async (phone, amount) => {
  try {
    const user = await User.findOne({phone:phone});
    if (!user) {
      throw new Error('User not found');
    }

    if (user.wallet < amount) {
      throw new Error('Insufficient funds');
    }

    user.wallet -= amount;
    await user.save();

    return user.wallet;
  } catch (error) {
    console.error('Error deducting funds:', error);
    throw error;
  }
};

module.exports = {
  addFunds,
  deductFunds,
};