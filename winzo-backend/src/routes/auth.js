const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Generate a simple invite code for new users. In production you might want a
 * more robust solution to avoid collisions.
 */
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Register a new user using an existing invite code or a master code.
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('inviteCode').notEmpty().withMessage('Invite code is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, inviteCode } = req.body;

  try {
    // Invite code must match the master code or belong to an existing user.
    const masterCode = process.env.MASTER_INVITE_CODE;
    const inviter = await User.findOne({ where: { inviteCode } });
    if (inviteCode !== masterCode && !inviter) {
      return res.status(400).json({ message: 'Invalid invite code' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashed,
      inviteCode: generateInviteCode(),
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Authenticate user credentials and issue a JWT token.
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Return the authenticated user's data minus the password field.
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
