const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
        
        const connection = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✓ MongoDB Connected Successfully`);
        console.log(`✓ Database: ${connection.connection.db.databaseName}`);
        
        return connection;
    } catch (error) {
        console.error(`✗ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDatabase;
