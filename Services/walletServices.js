// walletService.js
const User = require('../models/userModel');
const Ref=require(`../models/referModel`);
const Wallet=require('../models/walletModel');
const addFunds = async (phone, amount) => {
  try {
    // Find user
    let user = await User.findOne({ phone: phone });

    // If user not found, throw an error
    if (!user) {
      throw new Error('User not found');
    }

    // Update user's wallet
    user.wallet += amount;

    // Find referred users
    const referredUsers = await User.findOne({ refer_id: user.user_id });

    if (referredUsers){
      const referralBonus = 0.05 * amount;
      for (const referredUser of referredUsers) {
        referredUser.referred_wallet += referralBonus;
        await referredUser.save();
      }
      let ref = await Ref.findOne({ phone: phone });
      if (ref) {
        ref.referred.push(...referredUsers.map(user => ({
          user_id: user.user_id,
          avatar: user.avatar,
          amount: referralBonus
        })));
      } else {
        ref = new Ref({
          phone:referredUsers.phone,
          referred: referredUsers.map(user => ({
            user_id: user.user_id,
            avatar: user.avatar,
            amount: referralBonus
          }))
        });
      }

      await ref.save();
    }

    // Save the updated user
    await user.save();

    // Find wallet
    let wallet = await Wallet.findOne({ phone: phone });

    // If wallet not found, create a new one
    if (!wallet) {
      wallet = new Wallet({
        phone,
        walletTrans: []
      });
    }

    // Add the new transaction to wallet
    wallet.walletTrans.push({ time: new Date(), amount: amount, status: 0 });
    await wallet.save();

    // Return updated wallet balance
    return user.wallet;
  } catch (error) {
    console.error('Error adding funds:', error);
    throw error;
  }
};

  

const deductFunds = async (phone, amount,paymentId,bankId=0,ifscCode=0) => {
  try {
    // Find user
    const user = await User.findOne({ phone: phone });

    // Find wallet
    let wallet = await Wallet.findOne({ phone: phone });

    // If user not found, throw an error
    if (!user) {
      throw new Error('User not found');
    }

    // If insufficient funds, throw an error
    if (user.withdrwarl_amount < amount) {
      throw new Error('Insufficient funds');
    }

    // Deduct amount from user's wallet
    user.wallet -= amount;
    user.withdrwarl_amount-=amount
    await user.save();

    // If wallet not found, create a new one
    if (!wallet) {
      wallet = new Wallet({
        phone,
        amount: 0, // Set the initial value to 0
        walletTrans: [{
          status:0,
        }
        ],
      });
    }

    // Add the new transaction with a negative amount to represent deduction
    wallet.walletTrans.push({ time: new Date(), amount: -amount, status: 0,paymentId,bankId,ifscCode });
    await wallet.save();

    // Return updated user wallet balance
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