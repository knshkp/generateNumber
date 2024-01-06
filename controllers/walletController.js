// yourController.js
const User=require('../models/userModel')
const walletService = require('../Services/walletServices');
const depositFunds = async (req, res) => {
  
    // console.log(`>>>>>>>>>>>>>>${json.stringify(req.body)}`)
  const phone=req.body.phone
  const amount=req.body.amount
  try {
    const newBalance = await walletService.addFunds(phone, amount);
    res.status(200).json({ newBalance });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getWallet = async (req, res) => {
  try {
    const { phone } = req.query; // Assuming phone is in the request body
    const wallet = await User.findOne({ phone });

    if (!wallet) {
      return res.status(404).json({ error: 'User not found' });
    }

    const walletMoney = wallet.wallet;
    res.status(200).json({ wallet:walletMoney });
  } catch (error) {
    console.error('Error getting wallet:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const withdrawFunds = async (req, res) => {
  const { phone, amount } = req.body;

  try {
    const newBalance = await walletService.deductFunds(phone, amount);
    res.status(200).json({ newBalance });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  depositFunds,
  withdrawFunds,
  getWallet
};
