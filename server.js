const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDatabase = require('./config/database');
const errorMiddleware = require('./middlewares/error');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger/swagger.json');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to Database
connectDatabase();

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
    customCss: '.swagger-ui .topbar { display: none }'
}));

// Routes
const userRoutes = require('./routes/userRoute');
const productRoutes = require('./routes/productRoute');
const orderRoutes = require('./routes/orderRoute');

app.use('/api/v1', userRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', orderRoutes);

// Health Check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running'
    });
});

// Error Middleware (Must be last)
app.use(errorMiddleware);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Unhandled Exception Handler
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

// Start Server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;
