const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const router = express.Router();

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'winzo-secret-key-change-in-production';

// Helper function to generate JWT token
function generateToken(userId, isAdmin = false) {
    return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: '1h' });
}

// POST /api/register - Create a new user
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Check if email already exists
        const existingUserResult = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUserResult.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create new user in database
        const newUserResult = await query(
            'INSERT INTO users (email, password_hash, balance) VALUES ($1, $2, $3) RETURNING id, email, balance, is_admin, created_at',
            [email, passwordHash, 1000.00]
        );

        const newUser = newUserResult.rows[0];

        // Generate JWT token
        const token = generateToken(newUser.id, newUser.is_admin);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: token,
            user: {
                id: newUser.id,
                email: newUser.email,
                balance: parseFloat(newUser.balance),
                created_at: newUser.created_at
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// POST /api/login - Verify credentials and return JWT token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user by email in database
        const userResult = await query('SELECT id, email, password_hash, balance, is_admin, created_at FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = userResult.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken(user.id, user.is_admin);

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                balance: parseFloat(user.balance),
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET /api/profile - Return current user info (requires valid token)
router.get('/profile', async (req, res) => {
    try {
        // User info is attached by JWT middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        // Find user in database
        const userResult = await query('SELECT id, email, balance, is_admin, created_at FROM users WHERE id = $1', [user.userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const userData = userResult.rows[0];

        res.json({
            success: true,
            user: {
                id: userData.id,
                email: userData.email,
                balance: parseFloat(userData.balance),
                created_at: userData.created_at
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = { router };
