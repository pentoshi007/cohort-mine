const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(cookieParser());

const users = [];
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateToken(username) {
    return jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Universal authentication middleware that checks for JWT tokens in multiple locations:
 * 1. Cookie (token)
 * 2. Authorization header (Bearer token)
 * 3. Custom header (x-auth-token)
 * 4. Query parameter (token) - not recommended for production
 * 
 * Priority order: Cookie > Authorization Header > Custom Header > Query Parameter
 */
function authenticateToken(req, res, next) {
    let token = null;

    // Priority 1: Check cookie (most secure with httpOnly)
    if (req.cookies?.token) {
        token = req.cookies.token;
    }
    // Priority 2: Check Authorization Bearer header
    else if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Priority 3: Check custom header
    else if (req.headers['x-auth-token']) {
        token = req.headers['x-auth-token'];
    }
    // Priority 4: Check query parameter (least secure)
    else if (req.query.token) {
        token = req.query.token;
    }

    // No token found anywhere
    if (!token) {
        return res.status(401).json({
            message: 'Authentication required. No token provided.',
            hint: 'Send token via Cookie, Authorization header, x-auth-token header, or query parameter'
        });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.username === decoded.username);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user info to request object for use in route handlers
        req.user = user;
        req.tokenData = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
}

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

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
    const foundUser = users.find(user => user.username === username && user.password === password);

    if (!foundUser) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(foundUser.username);

    // Set token in cookie (automatically sent with subsequent requests)
    res.cookie('token', token, {
        httpOnly: true,  // Prevents JavaScript access (XSS protection)
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        sameSite: 'strict',  // CSRF protection
        maxAge: 3600000  // 1 hour
    });

    // Also return token in response body (for clients that prefer header-based auth)
    res.status(200).json({
        message: 'Signed in successfully',
        token: token,
        note: 'Token is also set in httpOnly cookie'
    });
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Get current user info - works with ANY authentication method
app.get('/me', authenticateToken, (req, res) => {
    res.json({
        username: req.user.username,
        tokenExpiry: new Date(req.tokenData.exp * 1000).toISOString()
    });
});

// Dashboard - works with ANY authentication method
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({
        message: 'Welcome to your dashboard',
        username: req.user.username,
        data: 'This is protected content accessible via any authentication method'
    });
});

// Example: Get user profile
app.get('/profile', authenticateToken, (req, res) => {
    res.json({
        username: req.user.username,
        accountCreated: 'Recently',
        lastLogin: new Date().toISOString()
    });
});

// Example: Update user settings (protected POST route)
app.post('/settings', authenticateToken, (req, res) => {
    const { setting, value } = req.body;
    res.json({
        message: 'Settings updated',
        username: req.user.username,
        updated: { setting, value }
    });
});

// ============================================
// DEMO ROUTES (showing different auth methods)
// ============================================

// These routes are just for demonstration purposes
// In production, you'd just use the unified middleware above

app.get('/demo/cookie-only', (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: 'Cookie authentication only - no token in cookie' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ message: 'Authenticated via Cookie', username: decoded.username });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.get('/demo/bearer-only', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Bearer authentication only - send "Authorization: Bearer <token>"' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ message: 'Authenticated via Bearer token', username: decoded.username });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// ============================================
// SERVER
// ============================================

app.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log('\n📚 Authentication Methods Supported:');
    console.log('  1. Cookie (httpOnly) - Automatically sent by browser');
    console.log('  2. Authorization: Bearer <token>');
    console.log('  3. x-auth-token: <token>');
    console.log('  4. Query parameter: ?token=<token> (not recommended)\n');
});