require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Product = require('../models/productModel');

const connectDatabase = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✓ MongoDB Connected');
    } catch (error) {
        console.error('✗ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDatabase();

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});

        console.log('✓ Cleared existing data');

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@flipkart.com',
            password: 'admin123456',
            gender: 'male',
            role: 'admin',
            avatar: {
                filename: 'default.png',
                url: '/images/avatars/default.png'
            }
        });

        console.log('✓ Admin user created:', adminUser.email);

        // Create dummy user
        const dummyUser = await User.create({
            name: 'Dummy User',
            email: 'user@flipkart.com',
            password: 'user123456',
            gender: 'female',
            role: 'user',
            avatar: {
                filename: 'default.png',
                url: '/images/avatars/default.png'
            }
        });

        console.log('✓ Dummy user created:', dummyUser.email);

        // Create sample products
        const sampleProducts = [
            {
                name: 'iPhone 15 Pro',
                description: 'Latest Apple iPhone with advanced camera system',
                price: 99999,
                originalPrice: 129999,
                category: 'Electronics',
                brand: 'Apple',
                stock: 50,
                warranty: 12,
                highlights: ['5G', '48MP Camera', 'A18 Pro Chip', 'Titanium Design'],
                specifications: [
                    { key: 'Display', value: '6.7 inch OLED' },
                    { key: 'RAM', value: '8GB' },
                    { key: 'Storage', value: '256GB' }
                ],
                images: [
                    {
                        filename: 'iphone-1.jpg',
                        url: '/images/products/iphone-1.jpg'
                    }
                ],
                createdBy: adminUser._id
            },
            {
                name: 'Samsung 55 inch 4K TV',
                description: 'Ultra HD Smart TV with Crystal Processor',
                price: 49999,
                originalPrice: 79999,
                category: 'Electronics',
                brand: 'Samsung',
                stock: 20,
                warranty: 24,
                highlights: ['4K Resolution', 'Smart TV', 'HDR Support'],
                specifications: [
                    { key: 'Resolution', value: '4K (3840 x 2160)' },
                    { key: 'Panel Type', value: 'VA' }
                ],
                images: [
                    {
                        filename: 'samsung-tv.jpg',
                        url: '/images/products/samsung-tv.jpg'
                    }
                ],
                createdBy: adminUser._id
            },
            {
                name: 'Nike Running Shoes',
                description: 'Professional grade running shoes for athletes',
                price: 5999,
                originalPrice: 8999,
                category: 'Fashion',
                brand: 'Nike',
                stock: 100,
                warranty: 0,
                highlights: ['Lightweight', 'Breathable', 'Durable'],
                specifications: [
                    { key: 'Material', value: 'Mesh + Synthetic' },
                    { key: 'Weight', value: '250g per shoe' }
                ],
                images: [
                    {
                        filename: 'nike-shoes.jpg',
                        url: '/images/products/nike-shoes.jpg'
                    }
                ],
                createdBy: adminUser._id
            },
            {
                name: 'Sony Wireless Headphones',
                description: 'Noise canceling wireless headphones with 30hrs battery',
                price: 19999,
                originalPrice: 34999,
                category: 'Electronics',
                brand: 'Sony',
                stock: 75,
                warranty: 12,
                highlights: ['Active Noise Cancellation', '30hr Battery', 'Bluetooth 5.3'],
                specifications: [
                    { key: 'Connectivity', value: 'Bluetooth 5.3' },
                    { key: 'Battery Life', value: '30 hours' }
                ],
                images: [
                    {
                        filename: 'sony-headphones.jpg',
                        url: '/images/products/sony-headphones.jpg'
                    }
                ],
                createdBy: adminUser._id
            },
            {
                name: 'Wooden Office Chair',
                description: 'Ergonomic wooden office chair with lumbar support',
                price: 12999,
                originalPrice: 18999,
                category: 'Home',
                brand: 'FurnitureCo',
                stock: 30,
                warranty: 5,
                highlights: ['Ergonomic Design', 'Wood Material', 'Comfortable'],
                specifications: [
                    { key: 'Material', value: 'Engineered Wood' },
                    { key: 'Height Range', value: '44-48 inches' }
                ],
                images: [
                    {
                        filename: 'office-chair.jpg',
                        url: '/images/products/office-chair.jpg'
                    }
                ],
                createdBy: adminUser._id
            }
        ];

        const createdProducts = await Product.insertMany(sampleProducts);
        console.log(`✓ ${createdProducts.length} sample products created`);

        console.log('\n✓ Seed data successfully created!');
        console.log('\nLogin Credentials:');
        console.log('Admin: admin@flipkart.com / admin123456');
        console.log('User: user@flipkart.com / user123456');

        await mongoose.connection.close();
    } catch (error) {
        console.error('✗ Error seeding data:', error.message);
        process.exit(1);
    }
};

seedData();
