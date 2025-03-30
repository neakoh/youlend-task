const { setupLogging } = require('./logging');
const AccountService = require('../services/authService');

const { logger } = setupLogging();

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            logger.error(`Middleware: No token provided`);
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = await AccountService.verifyToken(token);
        // If user is admin, allow access regardless of other conditions
        if (decoded.role === 'admin') {
            logger.info(`Middleware: Admin access granted. User: ${decoded.userId}, Role: ${decoded.role}`);
            req.user = decoded;
            return next();
        }

        // For non-admin users, proceed with normal token verification
        req.user = decoded;
        logger.info(`Middleware: Token verified successfully. User: ${decoded.userId}, Role: ${decoded.role}`);
        next();
    } catch (error) {
        logger.error(`Middleware: Invalid token. Error: ${error.message}`);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = { authenticateToken };
