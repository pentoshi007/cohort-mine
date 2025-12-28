const mongoose = require('mongoose');

/**
 * Course Schema
 * Represents courses that can be created by admins and purchased by users
 */
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Reference to Admin model
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
