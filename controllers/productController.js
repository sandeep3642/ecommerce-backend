const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const fs = require('fs');
const path = require('path');

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products with pagination and filters
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of products
 */
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let filter = {};
    if (req.query.category) {
        filter.category = req.query.category;
    }

    if (req.query.search) {
        filter.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email');

    res.status(200).json({
        success: true,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        products
    });
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get single product details
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 */
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('reviews.userId', 'name');

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
        success: true,
        product
    });
});

/**
 * @swagger
 * /api/v1/admin/products:
 *   post:
 *     summary: Create new product (Admin only)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, originalPrice, category, brand, stock]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               originalPrice: { type: number }
 *               category: { type: string }
 *               brand: { type: string }
 *               stock: { type: integer }
 *               warranty: { type: integer }
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201:
 *         description: Product created successfully
 */
exports.createProduct = asyncErrorHandler(async (req, res, next) => {
    const { name, description, price, originalPrice, category, brand, stock, warranty, highlights, specifications } = req.body;

    // Validation
    if (!name || !description || !price || !originalPrice || !category || !brand || stock === undefined) {
        return next(new ErrorHandler('Please provide all required fields', 400));
    }

    // Process images
    let images = [];
    if (req.files && req.files.images) {
        const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        
        for (const file of imageFiles) {
            const filename = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.name)}`;
            const uploadPath = path.join(__dirname, '../public/images/products', filename);
            
            await file.mv(uploadPath);
            
            images.push({
                filename,
                url: `/images/products/${filename}`
            });
        }
    }

    const product = await Product.create({
        name,
        description,
        price,
        originalPrice,
        category,
        brand,
        stock,
        warranty: warranty || 0,
        images,
        highlights: highlights ? JSON.parse(highlights) : [],
        specifications: specifications ? JSON.parse(specifications) : [],
        createdBy: req.user.id
    });

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
    });
});

/**
 * @swagger
 * /api/v1/admin/products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags:
 *       - Admin - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // Check ownership
    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorHandler('Not authorized to update this product', 403));
    }

    const updateData = {
        ...req.body,
        updatedAt: Date.now()
    };

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product
    });
});

/**
 * @swagger
 * /api/v1/admin/products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags:
 *       - Admin - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // Delete associated images
    if (product.images && product.images.length > 0) {
        product.images.forEach(image => {
            const imagePath = path.join(__dirname, '../public', image.url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });
    }

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    });
});

/**
 * @swagger
 * /api/v1/products/{id}/review:
 *   post:
 *     summary: Add product review
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Review added successfully
 */
exports.addProductReview = asyncErrorHandler(async (req, res, next) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(r => r.userId.toString() === req.user.id);

    if (existingReview) {
        // Update existing review
        existingReview.rating = rating;
        existingReview.comment = comment;
    } else {
        // Add new review
        product.reviews.push({
            userId: req.user.id,
            userName: req.user.name,
            rating,
            comment
        });
    }

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    product.rating = totalRating / product.reviews.length;
    product.numOfReviews = product.reviews.length;

    await product.save();

    res.status(200).json({
        success: true,
        message: 'Review added successfully',
        product
    });
});

/**
 * @swagger
 * /api/v1/products/{id}/review:
 *   delete:
 *     summary: Delete product review
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review deleted successfully
 */
exports.deleteProductReview = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    product.reviews = product.reviews.filter(rev => rev.userId.toString() !== req.user.id);

    if (product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
        product.rating = totalRating / product.reviews.length;
    } else {
        product.rating = 0;
    }

    product.numOfReviews = product.reviews.length;

    await product.save();

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
    });
});
