const AccountService = require('../services/authService');
const { 
    sanitizeName,
    sanitizePassword
} = require('../utils/sanitizer');
const { schema, changePasswordSchema } = require('../utils/joischemas')

const { setupLogging } = require('../middleware/logging');
const { logger } = setupLogging();

class AccountController {
    async register(req, res, next) {
        try {
            logger.info('Controller: Processing registration request');
            const username = sanitizeName(req.body.username);
            const password = sanitizePassword(req.body.password);
            const isAdmin = req.body.isAdmin

            const { error } = schema.validate({ username, password });
            if (error) {  
                logger.error('Controller: Registration validation failed', { error: error.details[0].message });
                throw new Error(error.details[0].message);
            }

            const { user, token, message } = await AccountService.register(username, password, isAdmin);
            console.log(user);
            logger.info(`Controller: Registration successful for ${username}`);
            res.status(201).json({ user, token, message });
        } catch (error) {
            logger.error('Controller: Registration failed', { error: error.message });
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            logger.info('Controller: Processing login request');
            const username = sanitizeName(req.body.username)
            const password = sanitizePassword(req.body.password)

            const { user, token } = await AccountService.login(username, password);
            logger.info('Controller: Login successful', { username });
            res.status(200).json({ user, token });
        } catch (error) {
            logger.error('Controller: Login failed', { error: error.message });
            next(error);
        }
    }

    async getUserInfo(req, res, next) {
        try {
            logger.info('Controller: Processing get user info request');
            const userid = req.user.userID
            const user = await AccountService.get(userid);
            logger.info('Controller: Get user info successful', { userid });
            res.status(200).json(user);
        } catch (error) {
            logger.error('Controller: Get user info failed', { error: error.message });
            next(error);
        }
    }

    async changePassword(req, res, next) {
        const userid = req.user.userID

        const currentPassword = sanitizePassword(req.body.currentPassword)
        const newPassword = sanitizePassword(req.body.newPassword)

        const { error } = changePasswordSchema.validate({ currentPassword, newPassword });
        if (error) {
            logger.error('Controller: Password update validation failed', { error: error.details[0].message });
            throw new Error(error.details[0].message);
        }

        try {
            logger.info('Controller: Processing change password request');
            const result = await AccountService.updatePassword(userid, currentPassword, newPassword); 
            logger.info('Controller: Change password successful', { userid });
            res.status(200).json({ result });
        } catch (error) {
            logger.error('Controller: Change password failed', { error: error.message });
            next(error);
        }
    }

    async deleteUserInfo(req, res, next) {
        const userid = req.user.userID
        const password = sanitizePassword(req.body.password)
        try {
            logger.info('Controller: Processing delete user info request');
            const result = await AccountService.delete(userid, password);
            logger.info('Controller: Delete user info successful', { userid });
            res.status(200).json({ result });
        } catch (error) {
            logger.error('Controller: Delete user info failed', { error: error.message });
            next(error);
        }
    }
    
    async validate(req, res, next) {
        const userid = req.user.userID;
        const isAdmin = req.user.isAdmin;
        try {
            logger.info('Controller: Processing validate request');
            const result = await AccountService.validate(userid, isAdmin);   
            logger.info('Controller: Validate successful', { userid });
            res.status(200).json({ result });
        } catch (error) {
            logger.error('Controller: Validate failed', { error: error.message });
            next(error);
        }
    }
}

module.exports = new AccountController();
