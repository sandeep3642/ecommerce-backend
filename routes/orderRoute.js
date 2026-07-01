const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const {
    createOrder,
    getOrderDetails,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

// User Routes
router.post('/orders', isAuthenticatedUser, createOrder);
router.get('/orders/:id', isAuthenticatedUser, getOrderDetails);
router.get('/my-orders', isAuthenticatedUser, getMyOrders);

// Admin Routes
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.put('/admin/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);
router.delete('/admin/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
