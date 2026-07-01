const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    getAllUsers,
    getSingleUser,
    updateUserRole,
    deleteUser
} = require('../controllers/userController');

// Public Routes
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/logout', logoutUser);

// Protected Routes
router.get('/me', isAuthenticatedUser, getMe);

// Admin Routes
router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);
router.get('/admin/users/:id', isAuthenticatedUser, authorizeRoles('admin'), getSingleUser);
router.put('/admin/users/:id', isAuthenticatedUser, authorizeRoles('admin'), updateUserRole);
router.delete('/admin/users/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

module.exports = router;
