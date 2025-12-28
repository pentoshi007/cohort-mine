const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
    // Check if authorization header exists
    if (!req.headers.authorization) {
        return res.status(401).json({
            message: 'Unauthorized - No token provided'
        });
    }

    let token;
    try {
        token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized - Invalid token format'
            });
        }
    }
    catch (error) {
        return res.status(401).json({
            message: 'Unauthorized - Error parsing token',
            error: error.message
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: 'Unauthorized - Invalid or expired token',
                error: err.message
            });
        }

        // Verify user exists in DB (Security check)
        // This prevents admins (if secrets are same) or deleted users from accessing
        const user = await require('../models/User').findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized - User not found'
            });
        }

        req.user = decoded;
        next();
    });
};

module.exports = userAuth;