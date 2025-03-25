const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2,
    message: 'Too many accounts created from this IP, please try again after an hour.',
    standardHeaders: true,
    legacyHeaders: false, 
});

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    message: 'Too many login attempts, please try again after 10 minutes.',
    standardHeaders: true,
    legacyHeaders: false, 
});

const changePasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    keyGenerator: (req) => req.user.id,
    message: 'Too many password change attempts, please try again after an hour.',
    standardHeaders: true,
    legacyHeaders: false, 
});

const deleteUserLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 1 day
    max: 1,
    keyGenerator: (req) => req.user.id,
    message: 'You can only delete your account once per day.',
    standardHeaders: true,
    legacyHeaders: false, 
});

const getUserInfoLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    keyGenerator: (req) => req.user.id,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false, 
});

module.exports = { 
    registerLimiter,
    loginLimiter,
    changePasswordLimiter,
    deleteUserLimiter,
    getUserInfoLimiter,
}