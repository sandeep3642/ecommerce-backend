const express = require('express');
const router = express.Router();
const { productUpload } = require('../middlewares/upload');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const {
    getAllProducts,
    getProductDetails,
    createProduct,
    updateProduct,
    deleteProduct,
    addProductReview,
    deleteProductReview
} = require('../controllers/productController');

// Public Routes
router.get('/products', getAllProducts);
router.get('/products/:id', getProductDetails);

// User Routes
router.post('/products/:id/review', isAuthenticatedUser, addProductReview);
router.delete('/products/:id/review', isAuthenticatedUser, deleteProductReview);

// Admin Routes
router.post('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), productUpload.array('images', 5), createProduct);
router.put('/admin/products/:id', isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.delete('/admin/products/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;
