const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const gigs = new mongoose.Schema({
    gigs: [{
        type: Schema.Types.ObjectId,
        ref: 'Gigs',
    }],
    Tags: Array,
}, { timestamps: true }
);

module.exports = mongoose.model('Consumers', gigs);