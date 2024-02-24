const MinesTransaction=require('../models/minesTransactionModel');
const User = require('../models/userModel');
const Ref=require('../models/referModel');
const getMatrix = async (req, res) => {
    try {
        const number = req.query.number; // Assuming 'number' is the query parameter name

        // Validate the input to ensure it's a valid number
        const iterations = parseInt(number);

        if (isNaN(iterations)) {
            return res.status(400).json({ error: 'Invalid input. Please provide a valid number.' });
        }

        // Generate the 5x5 matrix
        const matrix = generateMatrix(iterations);
        const matrixx=flipMat(matrix)
        res.json(matrixx);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Helper function to generate the matrix
const generateMatrix = (iterations) => {
    const matrix = [];
    let totalOnes = 0;

    for (let i = 0; i < 5; i++) {
        const row = [];

        for (let j = 0; j < 5; j++) {
            if (totalOnes < iterations && Math.random() < 0.5) {
                // If totalOnes is less than iterations, include 1 with 50% probability
                row.push(1);
                totalOnes++;
            } else {
                row.push(0);
            }
        }
        
        matrix.push(row);
    }

    // If the total count of 1s is less than iterations, fill the remaining positions with 1s
    while (totalOnes < iterations) {
        const rowIndex = Math.floor(Math.random() * 5);
        const colIndex = Math.floor(Math.random() * 5);

        if (matrix[rowIndex][colIndex] === 0) {
            matrix[rowIndex][colIndex] = 1;
            totalOnes++;
        }
    }

    return matrix;
};
const flipMat = (matrix) => {
    const effectiveFlipNumber = Math.floor(Math.random() * 5) + 1;
  
    if (effectiveFlipNumber === 0) {
      // If effectiveFlipNumber is 0, no change
      return matrix;
    } else {
      // If effectiveFlipNumber is not 0, swap the rows
      const flippedMatrix = [...matrix];
      
      for (let i = 0; i < 5; i++) {
        if (effectiveFlipNumber + i < 5) {
          [flippedMatrix[i], flippedMatrix[effectiveFlipNumber + i]] = [flippedMatrix[effectiveFlipNumber + i], flippedMatrix[i]];
        }
      }
  
      return flippedMatrix;
    }
  };


const sendMinesMoney = async (req, res) => {
    const phone = req.body.phone;
    const time = req.body.multiply;
    const amount = req.body.amount;
  
    try {
      let userTransaction = await MinesTransaction.findOne({ phone });
  
      if (!userTransaction) {
        // Create a new transaction only if it doesn't exist
        // Otherwise, use the existing transaction
        userTransaction = new MinesTransaction({
          phone,
          transactions: []
        });
      }
  
      userTransaction.transactions.push({ time, amount: -amount });
  
      // Use a batch save for better performance
      await userTransaction.save();
  
      const sender = await User.findOne({ phone });
  
      if (!sender) {
        throw new Error('Sender not found');
      }
  
      if (sender.wallet < amount) {
        return res.status(400).json({ error: 'Insufficient Funds' });
      }
  
      sender.wallet -= amount;
      await sender.save();
  
      return res.status(200).json({ phone, newBalance: sender.wallet, time });
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(500).json({ error: 'Failed to send money. Please try again.' });
    }
  };
  
  
  const receiveMinesMoney = async (req, res) => {
    const phone = req.body.phone;
    const time = req.body.multiply;
    const amount = req.body.amount;
  
    try {
      const [sender, userTransaction] = await Promise.all([
        User.findOne({ phone }),
        MinesTransaction.findOne({ phone })
      ]);
  
      if (!sender) {
        throw new Error('Sender not found');
      }
  
      // Initialize userTransaction if not found
      let newUserTransaction = userTransaction;
      if (!newUserTransaction) {
        newUserTransaction = new MinesTransaction({
          phone,
          transactions: []
        });
      }
  
      const referredUsers = await User.find({ refer_id: sender.user_id });
  
      if (referredUsers.length > 0) {
        const referralBonus = 0.05 * amount * (time - 1.00);
  
        // Add the referral bonus to the referring user's account
        sender.wallet += referralBonus;
        sender.referral_wallet += referralBonus;
  
        // Save the updated referring user
        await sender.save();
  
        for (const referredUser of referredUsers) {
          referredUser.referred_wallet += referralBonus;
  
          let ref = await Ref.findOne({ phone: referredUser.phone });
  
          if (ref) {
            ref.referred.push({
              user_id: sender.user_id,
              avatar: sender.avatar,
              amount: referralBonus
            });
          } else {
            ref = new Ref({
              phone: referredUser.phone,
              referred: [{
                user_id: sender.user_id,
                avatar: sender.avatar,
                amount: referralBonus
              }]
            });
          }
  
          // Save the updated referred user and the Ref model
          await Promise.all([referredUser.save(), ref.save()]);
        }
      }
  
      sender.wallet += amount * time;
      sender.withdrawal_amount += amount * time;
      await Promise.all([newUserTransaction.save(), sender.save()]);
  
      // Send the response to the client
      return res.status(200).json({ success: true, message: 'Money received successfully', newBalance: sender.wallet, time });
    } catch (error) {
      console.error('Error receiving money:', error.message || error);
  
      // Send an error response to the client
      return res.status(500).json({ success: false, error: 'Failed to receive money. Please try again.' });
    }
  };
  

module.exports=
{
    getMatrix,
    generateMatrix,
    sendMinesMoney,
    receiveMinesMoney
}