const jwt = require('jsonwebtoken');

/**
 * Authentication middleware that verifies if the incoming request has a valid JWT.
 * 
 * This middleware assumes that the JWT token is sent as a Bearer token in the 
 * Authorization header of the HTTP request. It verifies the token using the secret key,
 * and if the token is valid, it adds the decoded user information to the request object
 * and allows the request to proceed to the next middleware or route handler.
 * If the token is missing or invalid, it sends an appropriate HTTP response.
 *
 * Usage: 
 * app.use(authMiddleware) - to protect all routes
 * app.get('/protected-route', authMiddleware, handlerFunction) - to protect specific route
 *
 * @param {Object} req - The request object from Express.js
 * @param {Object} res - The response object from Express.js
 * @param {Function} next - The next middleware function in the stack
 */
const authMiddlewares = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];// Expected format "Bearer TOKEN_HERE"

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id }; // Add decoded user info to request object
        next(); // Continue to the next middleware/route handler
    } catch (error) {
        // If token is not valid, send an invalid token response
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddlewares;
