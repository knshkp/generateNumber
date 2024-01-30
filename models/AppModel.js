const mongoose = require("mongoose");

const appSchema = new mongoose.Schema({
    version: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const App = mongoose.model('App', appSchema);

module.exports = App