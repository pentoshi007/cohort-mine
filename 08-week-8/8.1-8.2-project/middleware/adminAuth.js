const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
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

    jwt.verify(token, process.env.JWT_ADMIN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: 'Unauthorized - Invalid or expired token',
                error: err.message
            });
        }
        req.admin = decoded;
        next();
    });
};

module.exports = adminAuth;
