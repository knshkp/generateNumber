// yourController.js
const User=require('../models/userModel')
const walletService = require('../Services/walletServices');
const Wallet=require('../models/walletModel')
const depositFunds = async (req, res) => {
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
    console.log(req.query.phone)
    const { phone } = req.query; // Assuming phone is in the request body
    const wallet = await User.find({ phone:phone });
    console.log(wallet)
    if (!wallet) {
      return res.status(404).json({ error: 'User not found' });
    }

    const walletMoney = wallet[0].wallet;
    console.log('>>>>>>>>>>',walletMoney)
    res.status(200).send({ wallet:walletMoney,refer_wallet:wallet[0].referred_wallet,withdrawable_balance:wallet[0].withdrwarl_amount });
  } catch (error) {
    console.error('Error getting wallet:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};
const getWalletTrans = async (req, res) => {
  try {
    const wallets = await Wallet.find();

    // If no wallets found, return a 404 response
    if (!wallets || wallets.length === 0) {
      return res.status(404).json({ error: 'Wallets not found' });
    }

    // Extract wallet information and transactions
    const walletData = wallets.map((wallet) => ({
      phone: wallet.phone,
      walletTrans: wallet.walletTrans.filter(transaction => transaction.amount < 0)
    }));
    

    // Send wallet data as a response
    res.status(200).json({ wallets: walletData });
  } 
  catch (error) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getWalletApprovedTrans = async (req, res) => {
  try {
    const wallets = await Wallet.find();

    // If no wallets found, return a 404 response
    if (!wallets || wallets.length === 0) {
      return res.status(404).json({ error: 'Wallets not found' });
    }

    // Extract wallet information and transactions
    const walletData = wallets.map((wallet) => ({
      phone: wallet.phone,
      walletTrans: wallet.walletTrans.filter(transaction => transaction.status>0)
    }));
    

    // Send wallet data as a response
    res.status(200).json({ wallets: walletData });
  } 
  catch (error) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getWalletPendingTrans = async (req, res) => {
  try {
    const wallets = await Wallet.find();

    // If no wallets found, return a 404 response
    if (!wallets || wallets.length === 0) {
      return res.status(404).json({ error: 'Wallets not found' });
    }

    // Extract wallet information and transactions
    const walletData = wallets.map((wallet) => ({
      phone: wallet.phone,
      walletTrans: wallet.walletTrans.filter(transaction => transaction.status === 0 && transaction.amount < 0)

    }));
    

    // Send wallet data as a response
    res.status(200).json({ wallets: walletData });
  } 
  catch (error) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const updateStatus = async (req, res) => {
  try {
    const { phone, amount, status,id } = req.body;

    // Assuming you have a Wallet model
    const wallet = await Wallet.findOne({ phone: phone });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Find the transaction based on the amount
    const transaction = wallet.walletTrans.find(trans => trans._id == id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update the status in the transaction
    transaction.status = status;

    // Save the updated wallet
    await wallet.save();

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const withdrawFunds = async (req, res) => {
  const { phone, amount,paymentId,bankId,ifscCode } = req.body;

  try {
    const newBalance = await walletService.deductFunds(phone, amount,paymentId,bankId,ifscCode);
    res.status(200).json({ newBalance });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getWalletTransinction = async (req, res) => {
  try {
    // Extract phone number from request parameters or body
    const { phone } = req.query; // Assuming phone is a parameter in the route

    // Validate phone number format if needed

    // Find the wallet for the specified user
    const wallet = await Wallet.findOne({ phone });

    // If no wallet found, return a 404 response
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found for the specified user' });
    }

    // Extract wallet information and transactions
    const walletData = {
      phone: wallet.phone,
      walletTrans: wallet.walletTrans
    };

    // Send wallet data as a response
    res.status(200).json({ wallet: walletData });
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const convertAmount=async(req,res)=>{
  const {phone}=req.query
  const wallet=await User.findOne({phone})
  if(wallet.referred_wallet){
    wallet.wallet+=wallet.referred_wallet;
    wallet.referred_wallet=0;
  }
  await wallet.save()
  res.status(200).json({amount:wallet.wallet,referred_amount:wallet.referred_wallet
  })
}


module.exports = {
  depositFunds,
  withdrawFunds,
  getWallet,
  getWalletTrans,
  updateStatus,
  getWalletTransinction,
  convertAmount,
  getWalletApprovedTrans,
  getWalletPendingTrans
};
