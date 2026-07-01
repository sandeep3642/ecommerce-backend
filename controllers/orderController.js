const Order = require('../models/orderModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create new order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 */
exports.createOrder = asyncErrorHandler(async (req, res, next) => {
    const { items, totalPrice, discount, finalPrice, shippingAddress, paymentMethod } = req.body;

    if (!items || !items.length) {
        return next(new ErrorHandler('Please add items to order', 400));
    }

    const order = await Order.create({
        orderNumber: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
        userId: req.user.id,
        items,
        totalPrice,
        discount: discount || 0,
        finalPrice,
        shippingAddress,
        paymentMethod
    });

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
    });
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get single order details
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order details
 */
exports.getOrderDetails = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('items.productId', 'name price images')
        .populate('userId', 'name email');

    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    res.status(200).json({
        success: true,
        order
    });
});

/**
 * @swagger
 * /api/v1/my-orders:
 *   get:
 *     summary: Get user's orders
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 */
exports.getMyOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find({ userId: req.user.id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    });
});

/**
 * @swagger
 * /api/v1/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags:
 *       - Admin - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('userId', 'name email');

    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    });
});

/**
 * @swagger
 * /api/v1/admin/orders/{id}:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags:
 *       - Admin - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderStatus: { type: string }
 *               paymentStatus: { type: string }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order updated successfully
 */
exports.updateOrderStatus = asyncErrorHandler(async (req, res, next) => {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    if (orderStatus) {
        order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
        order.paymentStatus = paymentStatus;
    }

    order.updatedAt = Date.now();
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        order
    });
});

/**
 * @swagger
 * /api/v1/admin/orders/{id}:
 *   delete:
 *     summary: Delete order (Admin only)
 *     tags:
 *       - Admin - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order deleted successfully
 */
exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
    });
});
