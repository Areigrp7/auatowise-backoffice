// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = {
    // Verify JWT token
    verifyToken: (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
            req.user = decoded;
            next();
        } catch (error) {
            console.log({ error })
            res.status(400).json({ error: 'Invalid token.' });
        }
    },

    // Optional authentication (for routes that can work with or without auth)
    optionalAuth: (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
                req.user = decoded;
            } catch (error) {
                console.log({ error })
                // Token is invalid, but we don't block the request
                console.log('Invalid token for optional auth');
            }
        }
        next();
    }
};

module.exports = auth;