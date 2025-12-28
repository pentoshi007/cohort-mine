const mongoose = require('mongoose');

/**
 * Database Connection Logic
 * This function connects to MongoDB using the connection string from .env file
 */
async function connectDB() {
    try {
        // Get MongoDB URI from environment variables
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        // Connect to MongoDB
        await mongoose.connect(mongoURI);

        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1); // Exit process with failure
    }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

module.exports = connectDB;
