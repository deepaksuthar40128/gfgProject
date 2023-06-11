const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const gigs = new mongoose.Schema({
    Rating: Number,
    Name: String,
    NumberRates: Number,
    Tags: Array,
    Images: Array,
    price: Number,
    discription: String,
    Trainer: {
        type: Schema.Types.ObjectId,
        ref: "Trainder"
    },
    cousumer: [{
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }]
}, { timestamps: true }
);

module.exports = mongoose.model('Gigs', gigs);