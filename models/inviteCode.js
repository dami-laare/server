const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    index: {
        type: Number,
        default: 1
    }
})

module.exports = mongoose.model('Invite', inviteSchema);