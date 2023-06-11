const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const trainder = new mongoose.Schema({
    text: String,
    Rating: Number,
    NumberRates: Number,
    Tags: Map,
    Author: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
    }

}, { timestamps: true }
);

module.exports = mongoose.model('Reviews', trainder);