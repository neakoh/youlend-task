const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Would be less in prod 
    message: 'Too many accounts created from this IP, please try again after an hour.',
    standardHeaders: true,
    legacyHeaders: false, 
});

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Would be less in prod 
    message: 'Too many login attempts, please try again after 10 minutes.',
    standardHeaders: true,
    legacyHeaders: false, 
});

module.exports = { 
    registerLimiter,
    loginLimiter
}