const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const trainder = new mongoose.Schema({
    email: String,
    experiance: String,
    rating: Number,
    NumberRates: Number,
    gender: String,
    speslity:String,
    achivement: String,
    phone:Number,
    Gigs: [{
        type: Schema.Types.ObjectId,
        ref: 'Gigs'
    }],
    medical: String,
    TopReviewer: [{
        type: Schema.Types.ObjectId,
        ref: 'Reviewer'
    }]
}, { timestamps: true }
);

module.exports = mongoose.model('Trainder', trainder);