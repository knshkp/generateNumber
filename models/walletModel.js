const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    phone: {
        type: Number,
        required: true
    },
    walletTrans: [{
        amount: {
            type: Number,
            required: true
        },
        time: {
            type: Date,
            default: Date.now
        },
        status:{
            type:Number
        },
        paymentId:{
            type:String,
        },
        bankId:{
            type:String
        },
        ifscCode:{
            type:String
        }

    }]
}, {
    timestamps: true // This will add createdAt and updatedAt fields to the schema
});

const Transaction = mongoose.model('Wallet', walletSchema);

module.exports = Transaction;
