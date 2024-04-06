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
const getReward = async (req, res) => {
  try {
      // Generate the 5x5 matrix
      const arr=[
      {2:[1.05, 1.15, 1.26, 1.39, 1.53, 1.70, 1.90, 2.14, 2.42, 2.77, 3.20, 3.73, 4.41, 5.29, 6.47, 8.08, 10.39, 13.86, 19.40, 29.10, 48.50,97.00, 291.00]},
      {3:[1.10, 1.26, 1.45, 1.68, 1.96, 2.30, 2.73, 3.28, 3.98, 4.90, 6.13, 7.80, 10.14, 13.52, 18.59, 26.56, 39.84, 63.74, 111.55, 223.10, 557.75, 2231.00]},
      {4:[ 1.15, 1.39, 1.68, 2.05, 2.53, 3.17, 4.01, 5.16, 6.74, 8.99, 12.26, 17.16, 24.79, 37.18, 58.43, 98.38, 175.29, 350.59, 818.03, 2454.10, 12270.50]},
      {5:[1.21, 1.53, 1.96, 2.53, 3.32, 4.43, 6.01, 8.33, 11.80, 17.16, 25.74, 40.04, 65.07, 11.55, 204.51, 409.02, 920.29, 2454.10, 8589.35, 51335.98]},
      {6:[1.28, 1.70, 2.30, 3.17, 4.43, 6.33, 9.25, 13.88, 21.45, 34.32, 57.21, 100.11, 185.92, 371.83, 818.03, 2045.08, 6135.25, 24540.99, 171787.83]},
      {7:[1.35, 1.90, 2.73, 4.01, 6.01, 9.25, 14.65, 23.98, 40.73, 72.46, 135.86, 271.72, 588.74, 1412.97, 3885.66, 12962.19, 58284.86, 466278.90]},
      {8:[1.43, 2.14, 3.28, 5.16, 8.33, 13.88, 23.98, 43.16, 81.52, 163.03, 349.36, 815.17, 2119.45, 6358.35, 23313.95, 116569.73, 1049102.31]},
      {9:[1.52, 2.43, 3.98, 6.74, 11.80, 21.45, 40.76, 81.52, 173.22, 395.94, 989.85, 2771.59, 9007.66, 36030.68, 198169.49, 1981613.89]},
      {10:[1.62, 2.77, 4.90, 8.99, 17.16, 34.32, 72.46, 163.03, 395.94, 1055.84, 3167.53, 11083.35, 288244.38, 3170970.91]},
      {11:[1.73, 3.20, 6.13, 12.26, 25.74, 57.21, 135.86, 349.36, 989.85, 3167.53, 11874.23, 55431.74, 360300.13, 4324563.31]},
      {12:[1.87, 3.73, 7.80, 17.16, 40.04, 100.11, 271.72, 815.17, 2771.59, 11086.35, 55431.74, 388015.52, 5044201.77]},
      {13:[2.02,4.41, 10.14, 24.79, 65.07, 185.92, 588.74, 2119.45, 9007.66, 48040.97, 360300.13, 5044201.77]},
      {14:[ 2.20, 5.29, 13.52, 37.18, 111.55, 371.83, 1412.94, 6358.35, 36030.68, 288244.38, 4324563.31]},
      {15:[2.43, 6.47, 18.59, 58.43, 204.51, 818.03, 3885.66, 23313.95, 195169.49, 7170970.91]},
      {16:[2.69, 8.08, 26.56, 97.38, 409.02, 2045.08, 12952.19, 116569.73, 1981613.89]},
      {17:[3.03, 10.39, 39.84, 175.29, 920.29, 6135.25, 58284.86, 1049102.31]},
      {18:[3.46, 13.86, 63.74, 350.59, 2454.10, 24540.99, 466278.90]},
      {19:[4.04, 19.40, 111.55, 818.03, 8589.35, 171787.83]},
      {20:[4.85, 29.10, 223.10, 2454.10, 51535.98]},
      {21:[6.06, 48.50, 557.76, 12270.50]},
      {22:[8.08, 97.00, 2231.00,]},
      {23:[12.13, 291.00, ]},
      {24:[24.25]}
      ]
      res.status(200).send({result:arr});
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
        sender.wallet += referralBonus;
        sender.referred_wallet += referralBonus;
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
          } 
          else {
            ref = new Ref({
              phone: referredUser.phone,
              referred: [{
                user_id: sender.user_id,
                avatar: sender.avatar,
                amount: referralBonus
              }]
            });
          }
          await Promise.all([referredUser.save(), ref.save()]);
        }
      }
  
      sender.wallet += amount * time;
      sender.withdrwarl_amount += amount * time;
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
    receiveMinesMoney,
    getReward
}





