// generateController.js
const User = require('../models/userModel');
const Transaction=require('../models/transictionsModel')
const Ref=require('../models/referModel')
let topBets = [{ phone: '', amount: 0,avatar:'' }, { phone: '', amount: 0,avatar:'' }, { phone: '', amount: 0,avatar:'' }, { phone: '', amount: 0 ,avatar:''}, { phone: '', amount: 0,avatar:'' }];
function customBiasedNumber() {
  // Generate a random number between 0 and 1
  const probability = Math.random();

  if (probability <= 0.12) {
    // 40% chance: generate a number greater than 200
    return Math.floor(Math.random() * (2000 - 201) + 201);
  }
  else if(probability<0.08){
    return Math.floor(Math.random() * (1000 - 201) + 201);

  }
  else if(probability<0.32){
    return Math.floor((Math.random()*500)+100);
  } else {
    // 60% chance: generate a number less than 100
    return Math.floor((Math.random() * 100)+100);
  }
}
const generateAndBroadcastNumber = (io) => {
  let lastNumbers=[0,0,0,0,0,0]
  let targetNumber = 0;
  let currentNumber = 0;
  let timeRemaining = 10; // Initial countdown time in seconds
  let intervalId = null;
  let rocket=true;

  const generateAndBroadcast = () => {
    targetNumber = customBiasedNumber()+1;
    lastNumbers.push(targetNumber)
    if(lastNumbers.length>6){
      lastNumbers.shift();
    }
    currentNumber = 100;
    timeRemaining = 70; // Use the generated number for countdown time
    rocket=true;

    const timestamp = new Date().toISOString();
    const data = { number: currentNumber, lastNumbers: targetNumber, timestamp, time: timeRemaining * 1000 };

    io.emit('newNumber', data);

    clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (currentNumber < targetNumber) {
        // Increase the number
        currentNumber = Math.round(currentNumber * 1.005)+1;
        io.emit('updateData', { number: currentNumber, time: timeRemaining ,rocket:rocket,a:lastNumbers[0],b:lastNumbers[1],c:lastNumbers[2],d:lastNumbers[3],e:lastNumbers[4],f:lastNumbers[5]});
        io.emit('bet', { a: topBets[0], b: topBets[1], c: topBets[2], d: topBets[3], e: topBets[4],f:topBets[5],f:topBets[6],g:topBets[7],h:topBets[8],i:topBets[9]});

      } else if (timeRemaining > 0) {
        rocket=false
        // Decrease the time
        timeRemaining--;
        io.emit('updateData', { number: currentNumber, time: timeRemaining ,rocket:rocket,a:lastNumbers[0],b:lastNumbers[1],c:lastNumbers[2],d:lastNumbers[3],e:lastNumbers[4]});
        io.emit('bet', { a: topBets[0], b: topBets[1], c: topBets[2], d: topBets[3], e: topBets[4],f:topBets[5],f:topBets[6],g:topBets[7],h:topBets[8],i:topBets[9]});
      }
        // End the interval when both conditions are met
        else{
          topBets = [{ phone: '', amount: 0 }, { phone: '', amount: 0 }, { phone: '', amount: 0 }, { phone: '', amount: 0 }, { phone: '', amount: 0 }];
        clearInterval(intervalId);
        generateAndBroadcast();
      }
    }, 200);
  };

  // Call generateAndBroadcast to start the initial round
  

  // Return a function that can be used to start a new round externally
  generateAndBroadcast();
};



const sendMoney = async (io, phone, time, amount,avatar) => {
  try {
    let userTransaction = await Transaction.findOne({ phone });

    if (!userTransaction) {
      // Create a new transaction only if it doesn't exist
      // Otherwise, use the existing transaction
      userTransaction = new Transaction({
        phone,
        transactions: []
      });
    }

    userTransaction.transactions.push({ time, amount: -amount });

    // Keep only the top 10 bets
    if (topBets.length > 10) {
      topBets.pop();
    }

    // Use a batch save for better performance
    await Promise.all([userTransaction.save()]);

    const sender = await User.findOne({ phone });

    if (!sender) {
      throw new Error('Sender not found');
    }

    if (sender.wallet < amount) {
      io.emit('walletUpdated', { error: 'Insufficient Funds' });
    } else {
      sender.wallet -= amount;
      await sender.save();

      io.emit('walletUpdated', { phone, newBalance: sender.wallet, time });

      return { success: true, message: 'Money sent successfully' };
    }
  } catch (error) {
    console.error('Error sending money:', error.message || error);
    io.emit('walletUpdated', { error: 'Failed to send money. Please try again.' });
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

    // Initialize userTransaction if not found
    let newUserTransaction = userTransaction;
    if (!newUserTransaction) {
      newUserTransaction = new Transaction({
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
