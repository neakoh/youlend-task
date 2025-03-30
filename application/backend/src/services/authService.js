const { setupLogging } = require('../middleware/logging');
const memoryStore = require('../utils/memoryStore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Get logger instance
const { logger } = setupLogging();

if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET must be defined');
}

const JWT_SECRET = process.env.JWT_SECRET;

class AccountService {
    async register(username, password, isAdmin ) {
        logger.info('Service: Validating registration data');
        const users = memoryStore.get('users') || [];

        if (users.find(user => user.username === username)) {
            logger.error(`Service: Existing user re-registration attempt for ${username}`);
            throw new Error('Username already exists. Please use a different username.');
        }

        logger.info('Service: Hashing password');
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const role = isAdmin ? 'admin' : 'user';
        
        const newUser = {
            id: userId,
            username,
            password: hashedPassword,
            role
        };
        
        users.push(newUser);
        memoryStore.set('users', users);
        logger.info(`Service: User registered successfully for ${username}, role: ${role}`);
        
        const token = jwt.sign(
            { id: userId, username, role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        return { 
            user: {
                username,
                role
            },
            token,
            message: 'User registered successfully' 
        };
    }

    async login(username, password) {
        logger.info('Service: Processing login request');
        const users = memoryStore.get('users') || [];
        const user = users.find(u => u.username === username);

        if (!user) {
            logger.error(`Service: User not found for ${username}`);
            throw new Error('Invalid username or password');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            logger.error(`Service: Invalid password for user ${username}`, { username });
            throw new Error('Invalid username or password');
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        logger.info(`Service: Login successful for ${username}, role: ${user.role}`);
        return {
            user: {
                username: user.username,
                role: user.role
            },
            token
        };
    }
    
    verifyToken(token) {
        try {
            if (!token) {
                throw new Error('No token provided');
            }
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error(`Service: Token verification failed. Error: ${error.message}`);
            throw new Error('Invalid token');
        }
    }
}

module.exports = new AccountService();