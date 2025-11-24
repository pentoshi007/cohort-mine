const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = 3000;
const users = [];
const JWT_SECRET = 'secret-key';

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public folder

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }


    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }

    users.push({ username, password });
    res.status(201).json({ message: 'User created successfully' });
});

app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, message: 'Signed in successfully' });
});

app.get('/me', authenticateToken, (req, res) => {
    res.json({ username: req.user.username });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});