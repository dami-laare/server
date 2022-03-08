const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
// const catchAsyncErrors = require("./catchAsyncErrors");

// Checks if user is authenticated or not
exports.isAuthenticated = async (req, res, next) => {
    const { token } = req.body;
    if(!token){
        return next(new ErrorHandler('You must be logged in to access this feature', 400));
    }
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
};

// Check if user is authorized for this feature

exports.isAuthorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)){
            return next(new ErrorHandler('You are not authorized to use this feature', 403));
        }
        next()
    }
};