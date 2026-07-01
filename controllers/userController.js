const User = require('../models/userModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const fs = require('fs');
const path = require('path');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, gender]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               gender: { type: string, enum: [male, female, other] }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
exports.registerUser = asyncErrorHandler(async (req, res, next) => {
    const { name, email, password, gender } = req.body;

    // Validation
    if (!name || !email || !password || !gender) {
        return next(new ErrorHandler('Please provide all required fields', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler('Email already registered', 400));
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        gender,
        avatar: {
            filename: 'default.png',
            url: '/images/avatars/default.png'
        }
    });

    // Generate token
    const token = user.generateJWTToken();

    // Set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    });
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return next(new ErrorHandler('Please provide email and password', 400));
    }

    // Find user and select password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Check password
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Generate token
    const token = user.generateJWTToken();

    // Set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    });
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
exports.logoutUser = asyncErrorHandler(async (req, res, next) => {
    res.clearCookie('token');

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
});

/**
 * @swagger
 * /api/v1/me:
 *   get:
 *     summary: Get current user details
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 */
exports.getMe = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        count: users.length,
        users
    });
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get single user details (Admin only)
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 */
exports.getSingleUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User role updated
 */
exports.updateUserRole = asyncErrorHandler(async (req, res, next) => {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        return next(new ErrorHandler('Invalid role specified', 400));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        user
    });
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
exports.deleteUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    });
});
