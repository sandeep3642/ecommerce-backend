const ErrorHandler = require('../utils/errorHandler');

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // JWT Expired Error
    if (err.name === 'JsonWebTokenError') {
        const message = `Invalid JWT Token`;
        err = new ErrorHandler(message, 400);
    }

    if (err.name === 'TokenExpiredError') {
        const message = `JWT Token has expired`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose Cast Error
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const message = `Duplicate field value entered for ${Object.keys(err.keyValue)}`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorMiddleware;
