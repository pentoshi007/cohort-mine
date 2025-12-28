const express = require('express');
const courseRouter = express.Router();
const userAuth = require('../middleware/userAuth');
const Course = require('../models/Course');
const Purchase = require('../models/Purchase');
const { z } = require('zod');

// When using app.use('/course', router), these routes automatically get /course prefix
// So '/purchase' here becomes '/course/purchase' in the final app

// Validation schema for purchase
const purchaseSchema = z.object({
    courseId: z.string().min(1, "Course ID is required")
});

// POST /course/purchase - Purchase a course
courseRouter.post('/purchase', userAuth, async (req, res) => {
    // Validate request body
    const parsedData = purchaseSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedData.error
        })
    }

    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({
            message: "Course not found"
        })
    }

    try {
        // Create purchase (DB will prevent duplicates via unique index)
        const purchase = new Purchase({
            courseId,
            userId
        });
        await purchase.save();

        res.json({
            message: "Course purchased successfully",
            purchase
        })
    } catch (error) {
        // Handle duplicate purchase error (E11000 is MongoDB duplicate key error)
        if (error.code === 11000) {
            return res.status(400).json({
                message: "You have already purchased this course"
            })
        }
        // Handle other errors
        return res.status(500).json({
            message: "Error purchasing course",
            error: error.message
        })
    }
});

// GET /course/preview - Get all available courses (for browsing/shopping)
courseRouter.get('/preview', async (req, res) => {
    // No auth required - anyone can browse courses
    const courses = await Course.find({});
    res.json({
        message: "All available courses",
        courses
    })
});

// GET /course/overview - Get user's purchased courses
courseRouter.get('/overview', userAuth, async (req, res) => {
    const userId = req.user.id;

    // Find all purchases for this user and populate course details
    const purchases = await Purchase.find({ userId }).populate('courseId');

    // Extract just the course data (already populated)
    const courses = purchases.map(purchase => purchase.courseId);

    res.json({
        message: "Your purchased courses",
        courses
    })
});

module.exports = courseRouter;
