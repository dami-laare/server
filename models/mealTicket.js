const mongoose = require('mongoose');

const mealTicketSchema = new mongoose.Schema({
    expires: Date,
    value: {
        type: String,
        default: '1000'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        default: 'Valid'
    },
    createdAt: {
        type: Date,
    }
})

module.exports = mongoose.model('ticket', mealTicketSchema);