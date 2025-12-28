const express = require('express');
const userRouter = express.Router();
const { z } = require('zod');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Course = require('../models/Course');
const Purchase = require('../models/Purchase');
const userAuth = require('../middleware/userAuth');

// When using app.use('/user', router), these routes automatically get /user prefix
// So '/signup' here becomes '/user/signup' in the final app
// DON'T write '/user/signup' here or it will become '/user/user/signup' ❌
const UserSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    firstName: z.string().min(2),
    lastName: z.string().min(2)
})

const SignInSchema = z.object({
    email: z.email(),
    password: z.string().min(6)
})

userRouter.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    const parsedData = UserSchema.safeParse({ email, password, firstName, lastName });
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedData.error
        })
    }
    const user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({
            message: "User already exists"
        })
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, firstName, lastName });
    await newUser.save();


    res.status(201).json({
        message: "User Signed up successfully",
        newUser
    })
});

userRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const parsedData = SignInSchema.safeParse({ email, password });
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedData.error
        })
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "User not found"
        })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid password"
        })
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET/*, { expiresIn: '1h' }*/);
    res.status(200).json({
        message: "User Signed in successfully",
        token
    })






});

userRouter.get('/purchases', userAuth, async (req, res) => {
    const userId = req.user.id;

    // 1. Find all purchases for this user
    // 2. .populate('courseId') is the magic:
    //    - It looks at the 'courseId' field in the Purchase document
    //    - It sees it references the 'Course' model (defined in Purchase schema)
    //    - It automatically fetches the full Course document and replaces the ID with the actual object
    const purchases = await Purchase.find({ userId }).populate('courseId');

    // Now 'purchases' is an array where purchase.courseId is the FULL course object, not just an ID string
    // So we can just map over it to get the list of courses
    const courses = purchases.map(purchase => purchase.courseId);

    // No need for a second Course.find() query! We already have the data.

    res.json({
        message: "User Purchases route",
        courses
    })
});

module.exports = userRouter;