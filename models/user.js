const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const validator = require('validator');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isMobilePhone, 'Please enter a valid phone number']
    },
    pin: {
        type: String,
        select: false
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'Please enter a valid email'],
    },
    bvn: {
        type: String,
    },
    address: {
        type: String,
        default: 'Address'
    },
    otp: String,
    otpExpire: Date,
    createdAt: {
        type: Date,
        default: new Date(Date.now())
    },
    tickets: [
        {
            
            type: mongoose.Schema.ObjectId,
            ref: 'ticket'
            
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verified: {
        type: Boolean,
        default:false
    },
    card: [
        {
            cardNo: String,
            expMnth: String,
            expYr: String,
            cvv: String,
            pin: String,
            valid: {
                type: Boolean,
                default: false
            }
        }
    ],
    addedCard:{
        type: Boolean,
        default: false
    },
    registered:{
        type: Boolean,
        default: false
    },
    bvnAdded: {
        type: Boolean,
        default: false 
    },
    availableBal:{
        type: Number,
        default: 10000
    },
    transactions: [
        {
            transactionReference: String,
            paymentReference: String,
            status: {
                type: String,
                default: 'PENDING'
            }
        }
    ]

});

// Encrypt password before save
userSchema.pre('save', async function(next) {
    if(!this.isModified('pin')) {
        if(this.isModified('card')){
            this.card[0].cvv = await bcrypt.hash(`${this.card[0].cvv}`, 13)
            this.card[0].pin = await bcrypt.hash(`${this.card[0].pin}`, 13) 
        }
        if(this.isModified('bvn')){
            this.bvn = await bcrypt.hash(`${this.bvn}`, 13)
        }
        next()
    }
    this.pin = await bcrypt.hash(`${this.pin}`, 13)
})


// Compare encrypted PIN with entered PIN during login
userSchema.methods.comparePin = async function(enteredPIN) {
    return await bcrypt.compare(enteredPIN, this.pin);
}

// Return JWT token

userSchema.methods.getJwtToken = function(){
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

// Generate reset password token 

userSchema.methods.getResetPasswordToken = function(){
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set resetPasswordExpire 
    this.resetPasswordExpire = Date.now() + (30 * 60 * 1000);

    return resetToken;
}


module.exports = mongoose.model('User', userSchema);
