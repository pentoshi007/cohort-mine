const mongoose = require('mongoose');

/**
 * User Schema
 * Represents users who can purchase courses
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const User = mongoose.model('User', userSchema);

module.exports = User;
