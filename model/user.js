const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    profile: {
        type: String,
    },
    googleId: {
        type: String,
    },
    provider: {
        type: String,
        required: true,
    },
    gigs: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Gigs',
    }],
    Tags: Array,
    isTrainer:{
        type:Boolean,
        default:false,
    }
},{ timestamps: true }
);

module.exports = mongoose.model('Users', userSchema);