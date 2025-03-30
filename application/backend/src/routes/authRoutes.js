const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
    loginLimiter,
    registerLimiter
} = require('../middleware/rateLimiters');

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);

module.exports = router;    