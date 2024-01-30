const mongoose = require("mongoose");

const appSchema = new mongoose.Schema({
    version: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    link:{
        type:String,
        require:true
    }
});

const App = mongoose.model('App', appSchema);

module.exports = App