const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserDAO = require('../dao/UserDAO');

const JWT_SECRET = process.env.JWT_SECRET || 'snakes_and_ladders_super_secret_jwt_key_2026';

class AuthService {
    /**
     * Registers a new user with Name, DOB, Email, and Phone.
     */
    static async register({ name, dob, email, phone, password }) {
        if (!name || !dob || !email || !phone || !password) {
            throw new Error('All fields (name, dob, email, phone, password) are required.');
        }

        const existingUser = await UserDAO.findByEmail(email);
        if (existingUser) {
            throw new Error('An account with this email address already exists.');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const userId = uuidv4();

        const newUser = await UserDAO.create({
            id: userId,
            name,
            dob,
            email,
            phone,
            password_hash
        });

        const token = this.generateToken(newUser);
        return { user: newUser, token };
    }

    /**
     * Authenticates user credentials and returns JWT token.
     */
    static async login({ email, password }) {
        if (!email || !password) {
            throw new Error('Email and password are required.');
        }

        const user = await UserDAO.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password.');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password.');
        }

        const token = this.generateToken(user);
        const userProfile = {
            id: user.id,
            name: user.name,
            dob: user.dob,
            email: user.email,
            phone: user.phone,
            has_active_pass: Boolean(user.has_active_pass),
            created_at: user.created_at
        };

        return { user: userProfile, token };
    }

    /**
     * Retrieves current authenticated user profile.
     */
    static async getCurrentUser(userId) {
        const user = await UserDAO.findById(userId);
        if (!user) {
            throw new Error('User not found.');
        }
        return {
            ...user,
            has_active_pass: Boolean(user.has_active_pass)
        };
    }

    static generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
    }

    static verifyToken(token) {
        return jwt.verify(token, JWT_SECRET);
    }
}

module.exports = AuthService;
