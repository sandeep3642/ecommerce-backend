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
                name: 'Men Cotton Shirt',
                description: 'Comfortable cotton shirt for daily wear',
                price: 1499,
                originalPrice: 1999,
                category: 'Men',
                brand: 'StyleHub',
                stock: 50,
                warranty: 0,
                highlights: ['Soft Cotton', 'Regular Fit', 'Breathable'],
                specifications: [
                    { key: 'Fabric', value: '100% Cotton' },
                    { key: 'Fit', value: 'Regular' }
                ],
                images: [
                    {
                        filename: 'men-shirt.jpg',
                        url: '/images/products/men-shirt.jpg'
                    }
                ],
                createdBy: adminUser._id
            },
            {
                name: 'Women Summer Dress',
                description: 'Elegant summer dress for casual outings',
                price: 2499,
                originalPrice: 3499,
                category: 'Women',
                brand: 'TrendWear',
                stock: 40,
                warranty: 0,
                highlights: ['Lightweight', 'Breathable', 'Stylish'],
                specifications: [
                    { key: 'Fabric', value: 'Rayon' },
                    { key: 'Pattern', value: 'Floral' }
                ],
                images: [
                    {
                        filename: 'women-dress.jpg',
                        url: '/images/products/women-dress.jpg'
                    }
                ],
                createdBy: adminUser._id
            },
            {
                name: 'Classic Denim Jacket',
                description: 'Stylish denim jacket for everyday fashion',
                price: 2999,
                originalPrice: 3999,
                category: 'Clothing',
                brand: 'DenimCo',
                stock: 60,
                warranty: 0,
                highlights: ['Classic Design', 'Durable', 'Versatile'],
                specifications: [
                    { key: 'Fabric', value: 'Denim' },
                    { key: 'Style', value: 'Casual' }
                ],
                images: [
                    {
                        filename: 'denim-jacket.jpg',
                        url: '/images/products/denim-jacket.jpg'
                    }
                ],
                createdBy: adminUser._id
            },
            {
                name: 'Men Formal Trousers',
                description: 'Smart formal trousers for office and events',
                price: 1999,
                originalPrice: 2799,
                category: 'Men',
                brand: 'SmartStyle',
                stock: 35,
                warranty: 0,
                highlights: ['Polished Look', 'Comfort Fit', 'Wrinkle Resistant'],
                specifications: [
                    { key: 'Fabric', value: 'Polyester Blend' },
                    { key: 'Fit', value: 'Slim' }
                ],
                images: [
                    {
                        filename: 'men-trousers.jpg',
                        url: '/images/products/men-trousers.jpg'
                    }
                ],
                createdBy: adminUser._id
            },
            {
                name: 'Women Knit Top',
                description: 'Soft knit top perfect for casual and office wear',
                price: 1599,
                originalPrice: 2299,
                category: 'Women',
                brand: 'ChicWear',
                stock: 45,
                warranty: 0,
                highlights: ['Soft Knit', 'Comfortable', 'Easy Pairing'],
                specifications: [
                    { key: 'Fabric', value: 'Knit' },
                    { key: 'Sleeve', value: 'Half Sleeve' }
                ],
                images: [
                    {
                        filename: 'women-top.jpg',
                        url: '/images/products/women-top.jpg'
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
