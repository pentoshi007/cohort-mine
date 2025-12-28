const express = require('express');
const adminRouter = express.Router();
const Admin = require('../models/Admin');
const Course = require('../models/Course');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const adminAuth = require('../middleware/adminAuth');

const adminSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    firstName: z.string().min(2),
    lastName: z.string().min(2)
})

const SignInSchema = z.object({
    email: z.email(),
    password: z.string().min(6)
})

const courseSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(2),
    price: z.coerce.number().min(0),
    imageUrl: z.string().min(2)
})

adminRouter.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    const adminData = adminSchema.safeParse({ email, password, firstName, lastName });
    if (!adminData.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: adminData.error
        })
    }
    const admin = await Admin.findOne({ email });
    if (admin) {
        return res.status(400).json({
            message: "Admin already exists"
        })
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ email, password: hashedPassword, firstName, lastName });


    res.status(201).json({
        message: "Admin Signup route",
        newAdmin
    })
});

adminRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const parsedData = SignInSchema.safeParse({ email, password });
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedData.error
        })
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
        return res.status(400).json({

            error: "Admin not found"
        })
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        return res.status(400).json({

            error: "Invalid password"
        })
    }



    // Sign JWT with admin's id (MongoDB _id is auto-converted to string in JWT)
    // Payload: { id: "string representation of ObjectId" }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_ADMIN_SECRET/*, { expiresIn: '1h' }*/);
    res.status(200).json({
        message: "Admin Signin route",
        token
    })
});
// User JWT secret and admin JWT secret should be different for security

adminRouter.post('/course', adminAuth, async (req, res) => {
    const { title, description, price, imageUrl } = req.body;
    const parsedData = courseSchema.safeParse({ title, description, price, imageUrl });
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedData.error
        })
    }
    // req.admin.id comes from JWT payload (adminAuth middleware decodes the token)
    // It's a string, but Mongoose automatically converts it to ObjectId when saving
    const newCourse = new Course({
        title,
        description,
        price,
        imageUrl,
        creatorId: req.admin.id // String from JWT, auto-converted to ObjectId by Mongoose
    });
    await newCourse.save();
    res.json({
        message: "Admin Create Course route",
        newCourse
    })
});
adminRouter.put('/course/:id', adminAuth, async (req, res) => {
    const { title, description, price, imageUrl } = req.body;
    const parsedData = courseSchema.safeParse({ title, description, price, imageUrl });
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedData.error
        })
    }
    // const course =await Course.updateOne({ _id: req.params.id, creatorId: req.admin.id }, { title, description, price, imageUrl });//--another way to do it

    // Find course and verify ownership
    const course = await Course.findOne({ _id: req.params.id, creatorId: req.admin.id });
    if (!course) {
        return res.status(404).json({
            message: "Course not found or you don't have permission to update it"
        })
    }

    // Update course fields
    course.title = title;
    course.description = description;
    course.price = price;
    course.imageUrl = imageUrl;
    await course.save();

    res.json({
        message: "Course updated successfully",
        course
    })
})

adminRouter.delete('/course/:id', adminAuth, async (req, res) => {
    // Find course and verify ownership before deleting
    const course = await Course.findOneAndDelete({ _id: req.params.id, creatorId: req.admin.id });
    if (!course) {
        return res.status(404).json({
            message: "Course not found or you don't have permission to delete it"
        })
    }

    res.json({
        message: "Course deleted successfully",
        course
    })
});

adminRouter.get('/course/bulk', adminAuth, async (req, res) => {
    const courses = await Course.find({ creatorId: req.admin.id });
    res.json({
        message: "Admin Bulk Create Course route",
        courses
    })

});

module.exports = adminRouter;
