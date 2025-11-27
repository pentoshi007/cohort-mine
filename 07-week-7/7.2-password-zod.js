/*
Improvements from previous week 7.1:
1. Password is not hashed
2. A single crash (duplicate email) crashes the whole app
3. Add more endpoints (mark todo as done)
4. Add timestamp at which todo was created/the time it needs to be done by
5. Relationships in Mongo
6. Add validations to ensure email and password are correct format
*/

//codes from week 7.1

//npm install zod bcryptjs 
const express = require('express');
const { UserModel, TodoModel } = require('./7.2-db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { z } = require('zod');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
})
    .catch((err) => {
        console.log('Error connecting to MongoDB', err);
    });

function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const userSchema = z.object({
        name: z.string().min(3),
        email: z.string().email().min(3).max(100),
        password: z.string().min(6).max(100),
    });
    const result = userSchema.safeParse(req.body);//safeParse will return an object with success and data properties and will not throw an error if the input is invalid
    if (!result.success) {
        return res.status(400).json({ message: result.error.message });
    }

    // const user = new UserModel({ name, email, password });
    // user.save();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);//if i remove 10 then no need to await.
        await UserModel.create({ name, email, password: hashedPassword });

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Error creating user' });
    }
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET);
    res.status(200).json({ message: 'Login successful', token });


});
app.get('/todos', auth, async (req, res) => {
    const todos = await TodoModel.find({ userId: req.userId });// todos will be an array of todo objects like: [{ _id: ObjectId, title: String, done: Boolean, userId: ObjectId }, ...]
    res.status(200).json({ todos });
});//authenticated
app.post('/todos', auth, async (req, res) => {
    const { title, dueBy } = req.body;
    const todo = await TodoModel.create({ title, userId: req.userId, done: false, dueBy });
    res.status(201).json({ message: 'Todo created successfully', todo });
});//authenticated

app.patch('/todos/:id', auth, async (req, res) => {
    const { id } = req.params;

    // Method 1: Using findOneAndUpdate (current approach)
    const todo = await TodoModel.findOneAndUpdate(
        { _id: id, userId: req.userId },
        { done: true },
        { new: true } // returns the updated document instead of the original one
    );

    // Method 2: Manual approach (alternative)
    // const todo = await TodoModel.findOne({ _id: id, userId: req.userId });
    // if (todo) {
    //     todo.done = true;
    //     await todo.save();
    // }

    if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(200).json({ message: 'Todo marked as done', todo });
});//authenticated - mark todo as done

app.delete('/todos/:id', auth, async (req, res) => {
    const { id } = req.params;
    const todo = await TodoModel.findOneAndDelete({ _id: id, userId: req.userId });
    if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(200).json({ message: 'Todo deleted successfully' });
});//authenticated - delete todo

app.listen(3000, () => {
    console.log('Server is running on port 3000');
}); 