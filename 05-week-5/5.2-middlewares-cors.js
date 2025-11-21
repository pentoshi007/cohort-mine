// Middlewares in Express.js
// - Middlewares are functions that have access to request (req), response (res), and next middleware function
// - They can execute code, modify req/res objects, end request-response cycle, or call next middleware
// - Middlewares are executed in the order they are defined
// - Common use cases: logging, authentication, parsing request body, error handling, CORS

const express = require('express');
const app = express();

// 1. Application-level middleware (runs for all routes)
// This middleware logs every request
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next(); // Pass control to the next middleware
});

// 2. Built-in middleware
// Parse JSON request bodies
app.use(express.json());

// 3. Custom middleware function (defined separately)
function authMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (token === 'secret-token') {
        req.user = { id: 1, name: 'John Doe' };
        next(); // User is authenticated, proceed
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// 4. Route-specific middleware (applied to specific routes)
app.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
});

// 5. Multiple middlewares in a single route
const validateData = (req, res, next) => {
    if (req.body.name) {
        next();
    } else {
        res.status(400).json({ error: 'Name is required' });
    }
};

const logData = (req, res, next) => {
    console.log('Data received:', req.body);
    next();
};

app.post('/user', validateData, logData, (req, res) => {
    res.json({ message: 'User created', name: req.body.name });
});

// 6. Middleware with parameters (middleware factory)
function rateLimiter(maxRequests) {
    const requests = {};
    return (req, res, next) => {
        const ip = req.ip;
        requests[ip] = (requests[ip] || 0) + 1;
        if (requests[ip] > maxRequests) {
            res.status(429).json({ error: 'Too many requests' });
        } else {
            next();
        }
    };
}

app.get('/api/data', rateLimiter(5), (req, res) => {
    res.json({ data: 'Some data' });
});

// 7. Error-handling middleware (must have 4 parameters)
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// Public route (no middleware)
app.get('/public', (req, res) => {
    res.json({ message: 'Public data - no authentication needed' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

// CORS (Cross-Origin Resource Sharing)
// CORS is a security feature that restricts web pages from making requests to a different domain
// By default, browsers block cross-origin requests for security reasons

// Method 1: Manual CORS middleware - Allow all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Method 2: Manual CORS with multiple allowed origins
const allowedOrigins = ['http://localhost:3001', 'http://localhost:3002', 'https://myapp.com'];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true'); // Allow cookies
    res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Method 3: Using cors package (recommended)
// First install: npm install cors
// const cors = require('cors');

// 3a. Enable CORS for all routes and all origins
// app.use(cors());

// 3b. CORS with specific origin
// app.use(cors({
//     origin: 'http://localhost:3001'
// }));

// 3c. CORS with multiple origins
// app.use(cors({
//     origin: ['http://localhost:3001', 'http://localhost:3002', 'https://myapp.com'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true, // Allow cookies and authentication headers
//     optionsSuccessStatus: 200
// }));

// 3d. CORS with dynamic origin validation
// app.use(cors({
//     origin: function (origin, callback) {
//         const allowedOrigins = ['http://localhost:3001', 'https://myapp.com'];
//         // Allow requests with no origin (like mobile apps or Postman)
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true
// }));

// Method 4: CORS for specific routes only
// app.get('/api/public', cors(), (req, res) => {
//     res.json({ message: 'This route allows CORS from all origins' });
// });

// app.post('/api/data', cors({ origin: 'http://localhost:3001' }), (req, res) => {
//     res.json({ message: 'This route allows CORS only from localhost:3001' });
// });

// Method 5: Different CORS settings for different routes
// const publicCors = cors({ origin: '*' });
// const restrictedCors = cors({ 
//     origin: ['http://localhost:3001', 'https://myapp.com'],
//     credentials: true 
// });

// app.get('/api/public', publicCors, (req, res) => {
//     res.json({ message: 'Public API - accessible from anywhere' });
// });

// app.get('/api/private', restrictedCors, (req, res) => {
//     res.json({ message: 'Private API - restricted origins only' });
// });

// Example: Testing CORS
// app.get('/api/test-cors', (req, res) => {
//     res.json({ 
//         message: 'CORS test successful',
//         origin: req.headers.origin,
//         method: req.method
//     });
// });

