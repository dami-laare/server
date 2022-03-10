const QRCode = require('qrcode');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const sendToken = require('../utils/jwt');
const User = require('../models/user');
const MealTicket = require('../models/mealTicket');
const sendOTP = require('../utils/sendOTP');
const generateOTP = require('../utils/generateOTP');
const sendMail = require('../utils/sendMail');
const ErrorHandler = require('../utils/errorHandler');
const { send } = require('express/lib/response');


// Register a new user => api/v1/user/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    let { phone, name, email } = req.body;

    let formattedPhone = phone.replace(/0/, '+234');

    const preExistingUser = await User.findOne({phone});

    const otp = await generateOTP();
    
    // try{
    //     // await sendOTP(otp, formattedPhone);
    //     await sendMail(email, otp, next)
    // }catch(err){
    //     return next(new ErrorHandler(err.message, 400))

    // }
    const user = await User.create({
        phone, 
        name,
        email, 
        otp,
        otpExpire: new Date(Date.now() + 10 * 60 * 1000)
    });
   
    sendToken(user, 200, res, true)

});

exports.resendToken = catchAsyncErrors(async (req, res, next) => {
    const {email, phone} = req.user;

    const user = req.user;

    let formattedPhone = phone.replace(/0/, '+234');

    const otp = await generateOTP();

    try{
        // await sendOTP(otp, formattedPhone);
        await sendMail(email, otp, next)
    }catch(err){
        return next(new ErrorHandler(err.message, 400))

    }

    user.otp = otp;

    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000)

    await user.save();

    return sendToken(user, 200, res)
})

// Login user ==? api/v1/user/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const {phone, pin} = req.body;
    const user = await User.findOne({phone}).select('+pin');

    if(!user) {
        return next(new ErrorHandler('User does not exist', 400))
    }

    const isPinMatched = await user.comparePin(pin);

    if(!isPinMatched) {
        return next(new ErrorHandler('Invalid PIN', 401));
    }
    sendToken(user, 201, res, true);
})

exports.latest = catchAsyncErrors(async (req, res, next) => {
    const user = req.user
   
    sendToken(user, 201, res, true);
})


// Logout user /api/v1/logout

exports.logoutUser = catchAsyncErrors( async (req, res, next) => {
    const { token } = req.body;

    if(!token){
        return next(new ErrorHandler('You are already logged out', 400))
    };

    res.status(200).json({
        success: true,
        message: 'You have successfully logged out'
    });
});

// Verify OTP ==> api/v1/otp/verify
exports.verifyOTP = catchAsyncErrors(async (req, res, next) => {
    const {otp} = req.body;
    const user = req.user;

    const date = new Date(Date.now())

    if(user.otp !== otp || date.getTime() > user.otpExpire.getTime()) {
        return next(new ErrorHandler('OTP is either invalid or has expired', 400))
    }

    sendToken(user, 200, res)

    user.otp = null;
    user.otpExpire = null;

    await user.save()
})

// Add other user details ==> api/v1/user/pin/new
exports.addPin = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;

    const options = {              
        errorCorrectionLevel: 'H',            
      }
    const expires = new Date(Date.now());

    expires.setHours(23);
    expires.setMinutes(00);
    expires.setMinutes(00);

    const mealTicket = await MealTicket.create({
        createdBy: user._id,
        value: '200',
        expires
    })

    user.pin = req.body.pin;
    user.tickets.push({
        ticket: mealTicket._id,
    })
    user.registered = true

    await QRCode.toDataURL(mealTicket.id ,options, async (err, url) => {
        if(err){
            return next(new ErrorHandler('An error has occurred'));
        }
        await sendMail(user.email, null, next, url)
    })


    await user.save();

    console.log(user.email)


    sendToken(user, 200, res, true);
})
