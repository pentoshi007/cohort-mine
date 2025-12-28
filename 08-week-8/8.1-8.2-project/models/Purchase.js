const mongoose = require('mongoose');

/**
 * Purchase Schema
 * Represents the relationship between users and courses they've purchased
 * This is a join/junction table between User and Course
 */
const purchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', // Reference to Course model
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

/**
 * COMPOUND UNIQUE INDEX
 * ---------------------
 * This creates a database index on the combination of userId + courseId
 * 
 * What does { userId: 1, courseId: 1 } mean?
 * - Creates an index on BOTH fields together
 * - The "1" means ascending order (doesn't matter much here)
 * 
 * What does { unique: true } do?
 * - Ensures the COMBINATION of userId + courseId is unique in the database
 * - Prevents a user from purchasing the same course multiple times
 * 
 * Example:
 * ✅ User A can buy Course 1 (first time)
 * ❌ User A CANNOT buy Course 1 again (duplicate - will throw error)
 * ✅ User A can buy Course 2 (different course)
 * ✅ User B can buy Course 1 (different user)
 * 
 * Without this index, a user could accidentally purchase the same course multiple times!
 */
purchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
