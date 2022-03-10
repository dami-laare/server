const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const Invite = require('../models/inviteCode');
const referralCodes = require('referral-codes');
const ErrorHandler = require('../utils/errorHandler');
const MealTicket = require('../models/mealTicket');
const User = require('../models/user');

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

    if(!invite){
        return next(new ErrorHandler('Invite code is invalid', 401));
    }

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

exports.verifyMealTicket = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body

    try{

        const ticket = await MealTicket.findById(id);
    }catch(err){
        return next(new ErrorHandler('Invalid Ticket',400))
    }

    const timeNow = new Date(Date.now())

    if(!ticket){
        console.log(error)
        return next(new ErrorHandler('invalid Ticket', 400))

    }

    if(ticket.expires.getTime() - timeNow.getTime() <= 0) {
        return next(new ErrorHandler('Ticket has expired', 400))
    }   

    ticket.expires = new Date(Date.now())

    await ticket.save()

    res.status(200).json({
        success: true,
        message: 'Ticket is valid'
    })
})

exports.verifyUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.body.id)

    if(!user) {
        return next(new ErrorHandler('User not found', 404))
    }

    user.verified = true

    await user.save()

    res.json({
        message: 'User successfully verified',
        success: true
    })
})