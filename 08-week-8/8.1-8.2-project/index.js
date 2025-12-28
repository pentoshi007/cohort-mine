const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const connectDB = require('./db');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const adminRoutes = require('./routes/admin');



// Load environment variables from .env file
dotenv.config();
app.use(express.json());
app.use(express.static('public'));



const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
// app.use(express.json()); // Already added above

// Mount admin routes at /admin path
app.use('/admin', adminRoutes);

// Mount user routes at /user path
app.use('/user', userRoutes);

// Mount course routes at /course path
app.use('/course', courseRoutes);

async function startServer() {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Then start the server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('❌ Server error:', error.message);
        process.exit(1); // Exit process with failure
    }
}

// Start the server
startServer();