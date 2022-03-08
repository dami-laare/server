const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const Invite = require('../models/inviteCode');
const referralCodes = require('referral-codes');
const ErrorHandler = require('../utils/errorHandler');
const MealTicket = require('../models/mealTicket');

//Admin generate an invite code => api/v1/admin/generate 
exports.generateInviteCode = catchAsyncErrors(async (req, res, next) => {
    const code = await referralCodes.generate({
        prefix: 'fungry-',
        length: 20
    })

    const createdBy  = req.user;

    // Deletes previous invite code
    await Invite.deleteOne({index: 1});

    // Creates a new invite code
    await Invite.create({code: code[0], createdBy})

    res.json({
        success: true,
        code: code[0]
    })
});


// Validates an invite code => api/v1/invite/validate/:inviteCode
exports.validateInviteCode = catchAsyncErrors(async (req, res, next) => {
    const code = req.params.inviteCode

    const invite = await Invite.findOne({code});

    if(!invite || invite.status === 'used'){
        return next(new ErrorHandler('Invite code is invalid', 401));
    }

    invite.status = 'used';

    await invite.save();

    res.status(200).json({
        success: true
    })
});

// Generates meal ticket ==> api/v1/ticket
exports.generateMealTicket = catchAsyncErrors(async (req, res, next) => {
    const {value} = req.body
    const createdBy = req.user

    let date = new Date(Date.now());

    date.setHours(24)
    date.setMinutes(59)
    date.setSeconds(59)


    const ticket = await MealTicket.create({createdBy, expires: date, value})

    res.status(200).json({
        success: true,
        ticket
    })
})