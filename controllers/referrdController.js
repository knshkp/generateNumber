const Referred = require('../models/referModel');

const getReferredAmount = async (req, res) => {
  const { phone } = req.query;

  try {
    const userReferred = await Referred.findOne({ phone });

    if (!userReferred) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ referred: userReferred.referred });
  } catch (error) {
    console.error('Error getting Referred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}; 

module.exports= {getReferredAmount};
