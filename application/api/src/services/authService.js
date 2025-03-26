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
            logger.error('Service: Username already exists', { username });
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
        logger.info('Service: User registered successfully', { userId, role });
        
        const token = jwt.sign(
            { id: userId, username, role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log(`Service: User registered successfully for ${username}`)
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
            logger.error('Service: User not found', { username });
            throw new Error('Invalid username or password');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            logger.error('Service: Invalid password', { email: username });
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

        logger.info('Service: Login successful', { username, role: user.role });
        return {
            user: {
                username: user.username,
                role: user.role
            },
            token
        };
    }

    async get(id) {
        logger.info('Service: Retrieving user data');
        const users = memoryStore.get('users') || [];
        const user = users.find(u => u.id === id);

        if (!user) {
            logger.error('Service: User not found', { id });
            throw new Error('User not found');
        }

        logger.info('Service: User data retrieved successfully', { id });
        return {
            user: {
                username: user.username,
                userID: user.id,
                role: user.role
            }
        };
    }

    async updatePassword(id, currentPassword, newPassword ) {
        logger.info('Service: Validating password update data');
        const users = memoryStore.get('users') || [];
        const user = users.find(u => u.id === id);

        if (!user) {
            logger.error('Service: User not found', { id });
            throw new Error('User not found');
        }

        logger.info('Service: Verifying current password');
        const currentHashedPassword = user.password;

        const isMatch = await bcrypt.compare(currentPassword, currentHashedPassword);
        if (!isMatch) {
            logger.error('Service: Current password is incorrect', { id });
            throw new Error('Current password is incorrect');
        }

        logger.info('Service: Hashing new password');
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;
        memoryStore.set('users', users);
        logger.info('Service: Password updated successfully', { id });

        return { message: 'Password changed successfully' };
    }

    async delete(id, password) {
        logger.info('Service: Processing account deletion request');
        const users = memoryStore.get('users') || [];
        const user = users.find(u => u.id === id);

        if (!user) {
            logger.error('Service: User not found', { id });
            throw new Error('Wrong Password');
        }

        logger.info('Service: Verifying password for deletion');
        const retrieved_hash = user.password;
        const isPasswordValid = await bcrypt.compare(password, retrieved_hash);

        if (!isPasswordValid) {
            logger.error('Service: Invalid password for deletion', { id });
            throw new Error('Wrong Password');
        }

        if (isPasswordValid){
            logger.info('Service: Deleting user account');
            const index = users.indexOf(user);
            if (index > -1) {
                users.splice(index, 1);
            }
            memoryStore.set('users', users);
            logger.info('Service: Account deleted successfully', { id });
            return { message: 'Account deleted successfully' };
        }
    }

    async validate(id, isAdmin) {
        logger.info('Service: Validating user');
        const users = memoryStore.get('users') || [];
        const user = users.find(u => u.id === id);

        if (!user) {
            logger.error('Service: User not found', { id });
            return { error: "User not found" }
        }
    
        logger.info('Service: User validated successfully', { id });
        return { 
            firstname: user.firstname,
            isAdmin: isAdmin
        }
    }

    verifyToken(token) {
        try {
            if (!token) {
                throw new Error('No token provided');
            }
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error('Token verification failed', { error: error.message });
            throw new Error('Invalid token');
        }
    }
}

module.exports = new AccountService();