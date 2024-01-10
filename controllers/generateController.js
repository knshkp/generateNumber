// generateController.js
const User = require('../models/userModel');
const Transaction=require('../models/transictionsModel')
const generateAndBroadcastNumber = (io) => {
  let lastNumbers=[0,0,0,0,0,0]
  let targetNumber = 0;
  let currentNumber = 0;
  let timeRemaining = 10; // Initial countdown time in seconds
  let intervalId = null;
  let rocket=true;

  const generateAndBroadcast = () => {
    targetNumber = Math.floor(Math.random() * 100);
    lastNumbers.push(targetNumber)
    if(lastNumbers.length>6){
      lastNumbers.shift();
    }
    currentNumber = 0;
    timeRemaining = 100; // Use the generated number for countdown time
    rocket=true;

    const timestamp = new Date().toISOString();
    const data = { number: currentNumber, lastNumbers: targetNumber, timestamp, time: timeRemaining * 1000 };

    io.emit('newNumber', data);

    clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (currentNumber < targetNumber) {
        // Increase the number
        currentNumber++;
        io.emit('updateData', { number: currentNumber, time: timeRemaining ,rocket:rocket,a:lastNumbers[0],b:lastNumbers[1],c:lastNumbers[2],d:lastNumbers[3],e:lastNumbers[4]});
      } else if (timeRemaining > 0) {
        rocket=false
        // Decrease the time
        timeRemaining--;
        io.emit('updateData', { number: currentNumber, time: timeRemaining ,rocket:rocket,a:lastNumbers[0],b:lastNumbers[1],c:lastNumbers[2],d:lastNumbers[3],e:lastNumbers[4]});
      } else {
        // End the interval when both conditions are met
        clearInterval(intervalId);
        generateAndBroadcast();
      }
    }, 200);
  };

  // Call generateAndBroadcast to start the initial round
  

  // Return a function that can be used to start a new round externally
  generateAndBroadcast();
};




const sendMoney = async (io, phone, time, amount) => {
  try {
    const [sender, userTransaction] = await Promise.all([
      User.findOne({ phone }),
      Transaction.findOne({ phone })
    ]);

    if (!userTransaction) {
      userTransaction = new Transaction({
        phone,
        transactions: []
      });
    }

    userTransaction.transactions.push({ time, amount: -amount });

    // Use a batch save for better performance
    await Promise.all([userTransaction.save(), sender.save()]);

    if (!sender) {
      throw new Error('Sender not found');
    }

    if (sender.wallet < amount) {
      throw new Error('Insufficient funds');
    }

    sender.wallet -= amount;
    await sender.save();

    io.emit('walletUpdated', { phone, newBalance: sender.wallet, time });

    return { success: true, message: 'Money sent successfully' };
  } catch (error) {
    console.error('Error sending money:', error.message || error);
    throw new Error('Failed to send money. Please try again.');
  }
};

const receiveMoney = async (io, phone, time, amount) => {
  try {
    const [sender, userTransaction] = await Promise.all([
      User.findOne({ phone }),
      Transaction.findOne({ phone })
    ]);

    if (!sender) {
      throw new Error('Sender not found');
    }

    if (!userTransaction) {
      userTransaction = new Transaction({
        phone,
        transactions: []
      });
    }

    userTransaction.transactions.push({ time, amount: amount * time });

    // Use a batch save for better performance
    await Promise.all([userTransaction.save(), sender.save()]);

    io.emit('walletUpdated', { phone, newBalance: sender.wallet, time });

    return { success: true, message: 'Money received successfully' };
  } catch (error) {
    console.error('Error receiving money:', error.message || error);
    throw new Error('Server responded falsely');
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
