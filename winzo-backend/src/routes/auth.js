const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { sequelize } = require('../models')
const auth = require('../middleware/auth')

const router = express.Router()

/**
 * Generate a simple invite code for new users. In production you might want a
 * more robust solution to avoid collisions.
 */
function generateInviteCode () {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Register a new user using an existing invite code or a master code.
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('invite_code').notEmpty().withMessage('Invite code is required')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, password, email, invite_code } = req.body
    const normalizedUsername = username.toLowerCase()

    try {
    // Invite code must match the master code or belong to an existing user.
      const masterCode = process.env.MASTER_INVITE_CODE || 'WINZO2024'
      console.log('WINZO Registration: Master invite code configured:', masterCode ? 'Yes' : 'No')
      console.log('WINZO Registration: Received invite code:', invite_code)

      const inviter = await User.findOne({ where: { inviteCode: invite_code } }).catch(() => null)

      if (invite_code !== masterCode && !inviter) {
        console.log('WINZO Registration: Invalid invite code - not master and no inviter found')
        return res.status(400).json({ message: 'Invalid invite code' })
      }

      const existing = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('username')),
          normalizedUsername
        )
      })
      if (existing) {
        console.log('WINZO Registration: Username already taken:', normalizedUsername)
        return res.status(400).json({ message: 'Username already taken' })
      }

      console.log('WINZO Registration: Creating user with balance 100.00')
      const hashed = await bcrypt.hash(password, 10)
      const newUser = await User.create({
        username: normalizedUsername,
        email: email || null,
        password_hash: hashed,
        wallet_balance: 100.00 // Give new users some starting balance
      })

      console.log('WINZO Registration: User created successfully, ID:', newUser.id)
      const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      })

      console.log('WINZO Registration: JWT token generated')

      res.json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            wallet_balance: newUser.wallet_balance
          }
        }
      })
    } catch (err) {
      console.error('WINZO Registration Error:', err)
      console.error('WINZO Registration Error Stack:', err.stack)
      console.error('WINZO Registration Error Details:', {
        message: err.message,
        name: err.name,
        code: err.code,
        sqlMessage: err.sqlMessage
      })
      res.status(500).json({
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      })
    }
  })

// Authenticate user credentials and issue a JWT token.
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, password } = req.body
    const normalizedUsername = username.toLowerCase()

    try {
      const user = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('username')),
          normalizedUsername
        )
      })
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' })
      }

      const match = await bcrypt.compare(password, user.password_hash)
      if (!match) {
        return res.status(400).json({ message: 'Invalid credentials' })
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      })
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            wallet_balance: user.wallet_balance
          }
        }
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error' })
    }
  })

// Return the authenticated user's data minus the password field.
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        wallet_balance: user.wallet_balance,
        is_active: user.is_active,
        created_at: user.created_at
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
