const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
    loginLimiter,
    registerLimiter,
    changePasswordLimiter,
    deleteUserLimiter,
    getUserInfoLimiter

} = require('../middleware/rateLimiters');

router.post('/register',  authController.register);
router.post('/login', loginLimiter, authController.login);
router.put('/', changePasswordLimiter, authController.changePassword);
router.delete('/', deleteUserLimiter, authController.deleteUserInfo);
router.get('/', getUserInfoLimiter, authController.getUserInfo);
router.get('/validate-token', getUserInfoLimiter, authController.validate);


module.exports = router;