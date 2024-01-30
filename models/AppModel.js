const mongoose = require("mongoose");

const appSchema = new mongoose.Schema({
    version: {
        type: Number,
        required: true
    },
});

const App = mongoose.model('App', appSchema);

module.exports = App