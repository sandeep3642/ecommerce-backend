const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create directories if they don't exist
const productDir = 'public/images/products';
const avatarDir = 'public/images/avatars';

if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true });
}

if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

// Multer storage for products
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, productDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Multer storage for avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Multer configuration
const productUpload = multer({
    storage: productStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const avatarUpload = multer({
    storage: avatarStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = {
    productUpload,
    avatarUpload
};
