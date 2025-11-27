//no sql databases allow flexible schema design
//they are easy to scale and are not as rigid as sql databases, they can be horizontally scaled while sql databases are not easily scalable they need sharding and clustering to scale
//npm init -y
//npm install express mongoose jsonwebtoken
const express = require('express');
const { UserModel, TodoModel } = require('./7.1-db');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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
    // const user = new UserModel({ name, email, password });
    // user.save();
    await UserModel.create({ name, email, password });

    res.status(201).json({ message: 'User created successfully' });
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email, password });
    if (!user) {
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
    const { title } = req.body;
    const todo = await TodoModel.create({ title, userId: req.userId, done: false });
    res.status(201).json({ message: 'Todo created successfully', todo });
});//authenticated

app.listen(3000, () => {
    console.log('Server is running on port 3000');
}); 