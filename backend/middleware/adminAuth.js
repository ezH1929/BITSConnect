const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Make sure this path matches your User model path

const authMiddlewares = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Expected format "Bearer TOKEN_HERE"

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Retrieve user from the database
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'No user found with this token.' });
        }

        req.user = user; // Add user info to request object

        // Proceed only if user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. You are not authorized as an admin.' });
        }

        next(); // Continue to the next middleware/route handler
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddlewares;
