const AuthService = require('../../dom/AuthService');

/**
 * Middleware to authenticate requests using JWT Bearer header.
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. Authorization token missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = AuthService.verifyToken(token);
        req.user = decoded; // Contains id, email, name
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

module.exports = authMiddleware;
