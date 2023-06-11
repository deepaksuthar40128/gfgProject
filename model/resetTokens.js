const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const resetTokens = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: () => Date.now(),
    },
    expire_at: { type: Date, default: Date.now, expires: 600 }
});

module.exports = mongoose.model('resetTokens', resetTokens);