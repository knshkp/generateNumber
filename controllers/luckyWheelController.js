const LuckyTransaction = require("../models/LuckyTransictionsModel.js");
const User = require("../models/userModel.js");  // Import the User model
const Ref=require('../models/referModel')

let firstBet = 0;
let secondBet = 0;
let thirdBet = 0;

const generateAndBroadcastNumber = (io) => {
  let targetNumber = 0;
  let currentNumber = 0;
  let timeRemaining = 10; // Initial countdown time in seconds
  let intervalId = null;
  let winner = null;

  const generateAndBroadcast = () => {
    targetNumber = 100;
    currentNumber = 0;
    timeRemaining = 500; // Use the generated number for countdown time
    winner = '';
    clearInterval(intervalId);

    intervalId = setInterval(() => {

      if (timeRemaining > 0) {
        timeRemaining--;
        io.emit('luckyBet', { number: currentNumber, time: timeRemaining, result: winner,firstBet:firstBet,secondBet:secondBet,thirdBet:thirdBet  });
      }else if (currentNumber < targetNumber) {
        currentNumber += 1;
        io.emit('luckyBet', { number: currentNumber, time: timeRemaining, result: winner,firstBet:firstBet,secondBet:secondBet,thirdBet:thirdBet });
      }
      else if(currentNumber===targetNumber){
        firstBet = 0;
        secondBet = 0;
        thirdBet = 0;
      }  else {
        if (firstBet <= secondBet) {
          if (firstBet <= thirdBet) {
            winner = 0;
          } else {
            winner = 2;
          }
        } else {
          if (secondBet < thirdBet) {
            winner = 1;
          } else {
            winner = 2;
          }
        }

        clearInterval(intervalId);
        generateAndBroadcast();
      }
    }, 100); // Reduced the interval to 1000ms (1 second)
  };

  // Call generateAndBroadcast to start the initial round
  generateAndBroadcast();
};

const sendLuckyMoney = async (io, phone, color, amount) => {
  try {
    console.log(`>>>>>>>`)
    let userTransaction = await LuckyTransaction.findOne({ phone });
    const sender = await User.findOne({ phone });
    console.log(`>>>>>>>>><M<<<<`)

    if (!sender) {
      throw new Error('Sender not found');
    }

    if (!userTransaction) {
      console.log(`>>>>>>>><<><>`, phone)
      userTransaction = new LuckyTransaction({
        phone,
        transactions: [],
      });
    }
    console.log(`>>><><><?><>`)

    if (color === 0) {
      firstBet += 9.1 * amount; // Adjusted the multiplier
    } else if (color === 1) {
      secondBet += 2.1 * amount; // Adjusted the multiplier
    } else {
      thirdBet += 2.1 * amount; // Adjusted the multiplier
    }

    userTransaction.transactions.push({ color, amount: -amount });
    console.log(`>>>>>>>>>>`)
    await userTransaction.save(); // Removed unnecessary array wrapping
    console.log('<<<<<end1')

    if (sender.wallet < amount) {
      console.log('<<<<<end2')
      io.emit('walletLuckyUpdated', { error: 'Insufficient Funds' });
    } else {
      console.log('<<<<<end3')
      sender.wallet -= amount;
      await sender.save();

      io.emit('walletLuckyUpdated', { phone, newBalance: sender.wallet, color });
      console.log('<<<<<end4')

      return { success: true, message: 'Money sent successfully' };
    }
  } catch (error) {
    console.error('Error sending money:', error.message || error);
    io.emit('walletLuckyUpdated', { error: 'Failed to send money. Please try again.' });
    throw new Error('Failed to send money. Please try again.');
  }
};
  
  const receiveMoney = async (io, phone, color, amount) => {
    try {
      const [sender, userTransaction] = await Promise.all([
        User.findOne({ phone }),
        LuckyTransaction.findOne({ phone })
      ]);
  
      if (!sender) {
        throw new Error('Sender not found');
      }
  
      // Initialize userTransaction if not found
      let newUserTransaction = userTransaction;
      if (!newUserTransaction) {
        newUserTransaction = new LuckyTransaction({
          phone,
          transactions: []
        });
      }
  
      const referredUsers = await User.findOne({ refer_id: { $in: sender.user_id } });
      if (referredUsers) {
        const referralBonus = 0.05 * amount * (time - 1.00);
  
        // Add the referral bonus to the referring user's account
        referredUsers.referred_wallet += referralBonus;
  
        let ref = await Ref.findOne({ phone: referredUsers.phone });
        console.log(`>>>>>>>>>>>>>`, ref);
        if (ref) {
          ref.referred.push({
            user_id: sender.user_id,
            avatar: sender.avatar,
            amount: referralBonus
          });
        } else {
          ref = new Ref({
            phone: referredUsers.phone,
            referred: [{
              user_id: sender.user_id,
              avatar: sender.avatar,
              amount: referralBonus
            }]
          });
        }
  
        // Save the updated referring user and the Ref model
        await Promise.all([referredUsers.save(), ref.save()]);
      }
  
      sender.wallet += amount * time;
      sender.withdrwarl_amount += amount * time;
      await sender.save();
      newUserTransaction.transactions.push({ time, amount: amount * time });
  
      // Use a batch save for better performance
      await Promise.all([newUserTransaction.save(), sender.save()]);
  
      io.emit('walletLuckyUpdated', { phone, newBalance: sender.wallet, time });
  
      return { success: true, message: 'Money received successfully' };
    } catch (error) {
      console.error('Error receiving money:', error.message || error);
      throw new Error('Server responded falsely');
    }
  };
  
  const getLuckyTransactions = async (req, res) => {
    const { phone } = req.query;
  
    
    try {
      const userTransactions = await LuckyTransaction.findOne({ phone });
  
      if (!userTransactions) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ transactions: userTransactions.transactions });
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  module.exports = {
    generateAndBroadcastNumber,
    sendLuckyMoney,
    receiveMoney,
    getLuckyTransactions
  };
  