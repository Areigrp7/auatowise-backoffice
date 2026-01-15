// middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

exports.verifyAdmin = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Get user from the token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    // Check if user is an admin
    if (user.role !== User.ROLES.ADMIN) {
      return res.status(403).json({ error: 'Not authorized, must be an admin' });
    }

    req.user = user; // Attach admin user to the request
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};