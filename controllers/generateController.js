// generateController.js
const User = require('../models/userModel');
const Transaction=require('../models/transictionsModel')
const generateAndBroadcastNumber = (io) => {
  let targetNumber = 0;
  let currentNumber = 0;
  let timeRemaining = 10; // Initial countdown time in seconds
  let intervalId = null;
  let rocket=true;

  const generateAndBroadcast = () => {
    targetNumber = Math.floor(Math.random() * 100);
    currentNumber = 0;
    timeRemaining = 200; // Use the generated number for countdown time
    rocket=true;

    const timestamp = new Date().toISOString();
    const data = { number: currentNumber, target: targetNumber, timestamp, time: timeRemaining * 1000 };

    io.emit('newNumber', data);

    clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (currentNumber < targetNumber) {
        // Increase the number
        currentNumber++;
        io.emit('updateData', { number: currentNumber, time: timeRemaining ,rocket:rocket});
      } else if (timeRemaining > 0) {
        rocket=false
        // Decrease the time
        timeRemaining--;
        io.emit('updateData', { number: currentNumber, time: timeRemaining ,rocket:rocket});
      } else {
        // End the interval when both conditions are met
        clearInterval(intervalId);
        generateAndBroadcast();
      }
    }, 100);
  };

  // Call generateAndBroadcast to start the initial round
  

  // Return a function that can be used to start a new round externally
  generateAndBroadcast();
};





const sendMoney = async (io, phone, time,amount) => {
  try {
    const sender = await User.findOne({ phone });
    let userTransaction = await Transaction.findOne({phone})

    // If the user doesn't exist, create a new entry
    if (!userTransaction) {
      userTransaction = new Transaction({
        phone,
        transactions: []
      });
    }

    // Add the new transaction
    userTransaction.transactions.push({ time, amount:-amount });
    await userTransaction.save();

    res.status(201).json({ message: 'Transaction added successfully' })
    if (!sender) {
      throw new Error('Sender not found');
    }

    if (sender.wallet < amount) {
      throw new Error('Insufficient funds');
    }

    sender.wallet -= amount;
    await sender.save();

    io.emit('walletUpdated', { phone: phone, newBalance: sender.wallet,time:time });

    // Removed 'res' from here, as it's not available in this context
    return { success: true, message: 'Money sent successfully' };
  } catch (error) {
    console.error('Error sending money:', error.message || error);

    // Removed 'res' from here, as it's not available in this context
    throw new Error('Failed to send money. Please try again.');
  }
};

const receiveMoney = async (io,phone,time,amount) => {

  try {
    const sender = await User.findOne({ phone });
    if (!sender) {
      throw new Error('Sender not found');
    }
    let userTransaction = await Transaction.findOne({phone})

    // If the user doesn't exist, create a new entry
    if (!userTransaction) {
      userTransaction = new Transaction({
        phone,
        transactions: []
      });
    }

    // Add the new transaction
    userTransaction.transactions.push({ time, amount });
    await userTransaction.save();
    // Assuming time is a valid numeric value
    sender.wallet += amount * time;
    await sender.save();

    io.emit('walletUpdated', { phone: phone, newBalance: sender.wallet,time:time });

    return {success:true,message:"Money Receive Successfully"}
  } catch (error) {
    console.error('Error receiving money:', error.message || error);
    res.status(500).json({ success: false, message: 'Failed to receive money. Please try again.' });
  }
};
const getTransactions = async (req, res) => {
  const { phone } = req.query;

  try {
    const userTransactions = await Transaction.findOne({ phone });

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
  sendMoney,
  receiveMoney,
  getTransactions
};
