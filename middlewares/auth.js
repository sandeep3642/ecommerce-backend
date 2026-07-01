const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');

exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new ErrorHandler('Please login to access this resource', 401));
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedData.id);

        if (!req.user) {
            return next(new ErrorHandler('User not found', 404));
        }

        next();
    } catch (error) {
        return next(new ErrorHandler('Invalid token', 401));
    }
};

exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role: ${req.user.role} is not allowed to access this resource`,
                    403
                )
            );
        }
        next();
    };
};
