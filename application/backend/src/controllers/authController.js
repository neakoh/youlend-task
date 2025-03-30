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
                logger.error(`Controller: Registration validation failed. Error: ${error.details[0].message}`);
                throw new Error(error.details[0].message);
            }

            const { user, token, message } = await AccountService.register(username, password, isAdmin);
            logger.info(`Controller: Registration successful for ${username}`);
            res.status(201).json({ user, token, message });
        } catch (error) {
            logger.error(`Controller: Registration failed. Error: ${error.message}`);
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            logger.info('Controller: Processing login request');
            const username = sanitizeName(req.body.username)
            const password = sanitizePassword(req.body.password)

            const { user, token } = await AccountService.login(username, password);
            logger.info(`Controller: Login successful for ${username}`);
            res.status(200).json({ user, token });
        } catch (error) {
            logger.error(`Controller: Login failed. Error: ${error.message}`);
            next(error);
        }
    }
}

module.exports = new AccountController();
