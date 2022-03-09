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
        unique: true
    },
    pin: {
        type: String,
        select: false
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    bvn: {
        type: Number
    },
    address: {
        type: String,
        default: 'someone@gmail.com'
    },
    otp: String,
    otpExpire: Date,
    createdAt: {
        type: Date,
        default: new Date(Date.now())
    },
    role: {
        type: String,
        default: 'user'
    },
    tickets: [
        {
            ticket: {
                type: mongoose.Schema.ObjectId,
                ref: 'Meal Ticket'
            }
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verified: {
        type: Boolean,
        default:false
    },
    card: {
        number: String,
        exp: String,
    },
    addedCard:{
        type: Boolean,
        default: false
    }

});

// Encrypt password before save
userSchema.pre('save', async function(next) {
    if(!this.isModified('pin')) {
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
