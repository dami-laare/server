const ErrorHandler = require('../utils/errorHandler')


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    if (process.env.NODE_ENV === 'DEVELOPMENT') {
        res.status(err.statusCode).json({
            success: false,
            name: err.name,
            message: err.message,
            statusCode: err.statusCode,
            stack: err.stack
        })
    }
    if (process.env.NODE_ENV === 'PRODUCTION') {
        let error = {...err};

        error.message = err.message || 'Internal server error'

        if(err.name === 'CastError') {
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new ErrorHandler(message, 400)
        }

        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(error => error.message)
            error = new ErrorHandler(message, 400)
        }
        if (err.name === 'MongoServerError' && err.code === 11000) {
            error = new ErrorHandler('A user already exists with the same email', 500)
        }

        if(err.name === 'TokenExpiredError'){
            const message = 'JSON web token has expired'
            error = new ErrorHandler(message, 400);
        }

        if(err.name === 'JsonWebTokenError'){
            const message = 'JSON web token is invalid'
            error = new ErrorHandler(message, 400);
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message
        })
    }


    

}