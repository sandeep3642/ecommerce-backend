const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        required: [true, 'Please enter original price'],
        min: [0, 'Price cannot be negative']
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    images: [
        {
            filename: String,
            url: String
        }
    ],
    category: {
        type: String,
        required: [true, 'Please enter product category'],
        enum: {
            values: ['Men', 'Women', 'Clothing'],
            message: 'Category must be Men, Women, or Clothing'
        }
    },
    brand: {
        type: String,
        required: [true, 'Please enter brand name']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        default: 1,
        min: [0, 'Stock cannot be negative']
    },
    warranty: {
        type: Number,
        default: 0 // in months
    },
    highlights: [String],
    specifications: [
        {
            key: String,
            value: String
        }
    ],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            userId: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            userName: String,
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            comment: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Calculate discount before saving
productSchema.pre('save', function(next) {
    if (this.originalPrice && this.price) {
        this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);
