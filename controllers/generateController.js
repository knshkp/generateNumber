// generateController.js
const User = require('../models/userModel'); // Assuming you have a User model

const generateAndBroadcastNumber = (io) => {
  let targetNumber = 0;
  let currentNumber = 0;
  let timeRemaining = 10; // Initial countdown time in seconds
  let intervalId = null;

  const generateAndBroadcast = () => {
    targetNumber = Math.floor(Math.random() * 100);
    currentNumber = 0;
    timeRemaining = targetNumber + 30; // Use the generated number for countdown time

    const timestamp = new Date().toISOString();
    const data = { number: currentNumber, target: targetNumber, timestamp, time: timeRemaining * 1000 };

    io.emit('newNumber', data);

    clearInterval(intervalId);
    intervalId = setInterval(() => {
      timeRemaining--;

      currentNumber = Math.min(targetNumber, currentNumber + 1);

      io.emit('updateData', { number: currentNumber, target: targetNumber, time: timeRemaining });

      if (timeRemaining <= 0) {
        clearInterval(intervalId);
        generateAndBroadcast(); // Start a new round
      }
    }, 1000);
  };

  // Initial call to generateAndBroadcast
  generateAndBroadcast();
};

// const User = require('../models/userModel');

const sendMoney = async (req, res) => {
  const { phone, amount } = req.body;

  try {
    const sender = await User.findOne({ phone });
    if (!sender) {
      throw new Error('Sender not found');
    }

    if (sender.wallet < amount) {
      throw new Error('Insufficient funds');
    }

    sender.wallet -= amount;
    await sender.save();

    // Uncomment this section if you want to handle the receiver's wallet update
    // const receiver = await User.findById(receiverId);
    // if (!receiver) {
    //   throw new Error('Receiver not found');
    // }
    // receiver.wallet += amount;
    // await receiver.save();

    // Emit events to update sender's and receiver's wallets on the client side
    io.emit('walletUpdated', { userId: sender.id, newBalance: sender.wallet });
    // io.emit('walletUpdated', { userId: receiverId, newBalance: receiver.wallet });

    res.status(200).json({ success: true, message: 'Money sent successfully' });
  } catch (error) {
    console.error('Error sending money:', error.message || error);
    res.status(500).json({ success: false, message: 'Failed to send money. Please try again.' });
  };
}
const receiveMoney = async (req, res) => {
  const { phone, amount } = req.body;

  try {
    const sender = await User.findOne({ phone });
    if (!sender) {
      throw new Error('Sender not found');
    }

    if (sender.wallet < amount) {
      throw new Error('Insufficient funds');
    }

    sender.wallet += amount;
    await sender.save();

    // Uncomment this section if you want to handle the receiver's wallet update
    // const receiver = await User.findById(receiverId);
    // if (!receiver) {
    //   throw new Error('Receiver not found');
    // }
    // receiver.wallet += amount;
    // await receiver.save();

    // Emit events to update sender's and receiver's wallets on the client side
    io.emit('walletUpdated', { userId: sender.id, newBalance: sender.wallet });
    // io.emit('walletUpdated', { userId: receiverId, newBalance: receiver.wallet });

    res.status(200).json({ success: true, message: 'Money sent successfully' });
  } catch (error) {
    console.error('Error sending money:', error.message || error);
    res.status(500).json({ success: false, message: 'Failed to send money. Please try again.' });
  };
}
module.exports = {
  generateAndBroadcastNumber,
  sendMoney,
  receiveMoney
};
