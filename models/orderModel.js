const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    finalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    shippingAddress: {
        fullName: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'cod'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
