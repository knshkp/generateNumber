const mongoose = require("mongoose");

const referredSchema = new mongoose.Schema({
    phone: {
        type: Number,
        required: true
    },
    referred: [{
        user_id:{
            type:Number,
            required:true
        },
        amount: {
            type: Number,
            required: true
        },
        avatar:{
            type:Number,
            required:true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true // This will add createdAt and updatedAt fields to the schema
});

const Referred = mongoose.model('Referred', referredSchema);

module.exports = Referred
