
const User = require('../models/userModel');
const Transaction=require('../models/transictionsModel')
const Ref=require('../models/referModel')
let topBets = [{ phone: '', amount: 0,avatar:'' }, { phone: '', amount: 0,avatar:'' }, { phone: '', amount: 0,avatar:'' }, { phone: '', amount: 0 ,avatar:''}, { phone: '', amount: 0,avatar:'' }];
function customBiasedNumber() {
  // Generate a random number between 0 and 1
  const probability = Math.random();
   if (probability <= 0.03) {

        // 3% chance: generate a number between 100 and 105

        return 100;

    } else if (probability <= 0.19) {

        // 16% chance: generate a number between 100 and 105

        return Math.floor(Math.random() * 6) + 100;

    } else if (probability <= 0.22) {

        // 3% chance: generate a number between 105 and 110

        return Math.floor(Math.random() * 6) + 105;

    } else if (probability <= 0.28) {

        // 6% chance: generate a number between 110 and 120

        return Math.floor(Math.random() * 11) + 110;

    } else if (probability <= 0.33) {

        // 5% chance: generate a number between 120 and 130

        return Math.floor(Math.random() * 11) + 120;

    } else if (probability <= 0.40) {

        // 7% chance: generate a number between 130 and 150

        return Math.floor(Math.random() * 21) + 130;

    } else if (probability <= 0.54) {

        // 14% chance: generate a number between 150 and 200

        return Math.floor(Math.random() * 51) + 150;

    } else if (probability <= 0.72) {

        // 18% chance: generate a number between 200 and 300

        return Math.floor(Math.random() * 101) + 200;

    } else if (probability <= 0.78) {

        // 6% chance: generate a number between 300 and 400

        return Math.floor(Math.random() * 101) + 300;

    } else if (probability <= 0.87) {

        // 9% chance: generate a number between 400 and 500

        return Math.floor(Math.random() * 101) + 400;

    } else if (probability <= 0.93) {

        // 6% chance: generate a number between 500 and 600

        return Math.floor(Math.random() * 101) + 500;

    } else if (probability <= 0.96) {

        // 3% chance: generate a number between 600 and 1000

        return Math.floor(Math.random() * 401) + 600;

    } else if (probability <= 0.99) {

        // 3% chance: generate a number between 1000 and 2000

        return Math.floor(Math.random() * 1001) + 1000;

    } else {

        // 1% chance: generate a number between 2000 and 3000

        return Math.floor(Math.random() * 1001) + 2000;

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
        io.emit('bet', { a: topBets[0], b: topBets[1], c: topBets[2], d: topBets[3], e: topBets[4]});

      } else if (timeRemaining > 0) {
        rocket=false
        // Decrease the time
        timeRemaining--;
        io.emit('updateData', { number: currentNumber, time: timeRemaining ,rocket:rocket,a:lastNumbers[0],b:lastNumbers[1],c:lastNumbers[2],d:lastNumbers[3],e:lastNumbers[4]});
        io.emit('bet', {  a:topBets[0], b: topBets[1], c: topBets[2], d: topBets[3], e: topBets[4]});
      }
        // End the interval when both conditions are met
        else{
          topBets = [{ phone: '', amount: 0 },{ phone: '', amount: 0 },{ phone: '', amount: 0 },{ phone: '', amount: 0 }, { phone: '', amount: 0 }];
        clearInterval(intervalId);
        generateAndBroadcast();
      }
    }, 200);
  };

  // Call generateAndBroadcast to start the initial round
  

  // Return a function that can be used to start a new round externally
  generateAndBroadcast();
};



const sendMoney = async (io, phone, time, amount, avatar) => {
  try {
    let userTransaction = await Transaction.findOne({ phone });

    if (!userTransaction) {
      // Create a new transaction only if it doesn't exist
      // Otherwise, use the existing transaction
      userTransaction = new Transaction({
        phone,
        transactions: [],
      });
    }

    userTransaction.transactions.push({ time, amount: -amount });

    // Keep only the top 5 bets
    if (topBets.length >= 5) {
      // Check if the new amount is greater than the smallest amount in the topBets
      const smallestTopBet = Math.min(...topBets.map(bet => bet.amount));
      if (amount >= smallestTopBet) {
        // Remove the smallest bet and add the new bet
        topBets = topBets.filter(bet => bet.amount !== smallestTopBet);
        topBets.push({ phone, amount });
        topBets.sort((a, b) => b.amount - a.amount);
      }
    } else {
      // If topBets has less than 5 bets, simply add the new bet
      topBets.push({ phone, amount });
      topBets.sort((a, b) => b.amount - a.amount);
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
