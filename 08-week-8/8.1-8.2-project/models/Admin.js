const mongoose = require('mongoose');

/**
 * Admin Schema
 * Represents admins who can create and manage courses
 */
const adminSchema = new mongoose.Schema({
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

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
