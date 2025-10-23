const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// In-memory storage for users (in production, use a proper database)
const users = [];
let nextUserId = 1;

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'winzo-secret-key-change-in-production';

// Helper function to generate JWT token
function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
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
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = {
            id: nextUserId++,
            email: email,
            password_hash: passwordHash,
            balance: 1000, // Default starting balance
            created_at: new Date().toISOString()
        };

        users.push(newUser);

        // Generate JWT token
        const token = generateToken(newUser.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: token,
            user: {
                id: newUser.id,
                email: newUser.email,
                balance: newUser.balance,
                created_at: newUser.created_at
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
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

        // Find user by email
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                balance: user.balance,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/profile - Return current user info (requires valid token)
router.get('/profile', (req, res) => {
    try {
        // User info is attached by JWT middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        // Find user in our storage
        const userData = users.find(u => u.id === user.userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: userData.id,
                email: userData.email,
                balance: userData.balance,
                created_at: userData.created_at
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Export users array and nextUserId for wallet functionality
module.exports = { router, users, nextUserId };
