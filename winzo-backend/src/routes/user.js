const express = require('express')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { sequelize } = require('../models')

const router = express.Router()

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/avatars')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

/**
 * GET /api/user/profile - Get current user profile
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password_hash']
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zip_code,
        country: user.country,
        avatar: user.avatar_url,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        memberSince: user.created_at,
        walletBalance: user.wallet_balance
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * PUT /api/user/profile - Update user profile
 */
router.put('/profile', [
  auth,
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }

  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country
    } = req.body

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        })
      }
    }

    // Update user profile
    await user.update({
      first_name: firstName || user.first_name,
      last_name: lastName || user.last_name,
      email: email || user.email,
      phone: phone || user.phone,
      date_of_birth: dateOfBirth || user.date_of_birth,
      address: address || user.address,
      city: city || user.city,
      state: state || user.state,
      zip_code: zipCode || user.zip_code,
      country: country || user.country,
      email_verified: email && email !== user.email ? false : user.email_verified
    })

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zip_code,
        country: user.country,
        emailVerified: user.email_verified
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * POST /api/user/avatar - Upload user avatar
 */
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      })
    }

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Delete old avatar if exists
    if (user.avatar_url) {
      const oldAvatarPath = path.join(__dirname, '../../', user.avatar_url)
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath)
      }
    }

    // Update user with new avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    await user.update({ avatar_url: avatarUrl })

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl,
        filename: req.file.filename
      }
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * GET /api/user/preferences - Get user betting preferences
 */
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Parse preferences JSON or provide defaults
    const preferences = user.preferences
      ? JSON.parse(user.preferences)
      : {
          defaultStake: 10.00,
          quickStakeAmounts: [5.00, 10.00, 25.00, 50.00, 100.00],
          oddsFormat: 'decimal',
          autoAcceptOddsChanges: false,
          enableNotifications: true,
          emailNotifications: true,
          smsNotifications: false,
          betConfirmations: true,
          winLossUpdates: true,
          promotionalOffers: true,
          favoritesSports: [],
          favoritesTeams: []
        }

    res.json({
      success: true,
      message: 'Preferences retrieved successfully',
      data: preferences
    })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * PUT /api/user/preferences - Update user betting preferences
 */
router.put('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Validate preferences structure
    const {
      defaultStake,
      quickStakeAmounts,
      oddsFormat,
      autoAcceptOddsChanges,
      enableNotifications,
      emailNotifications,
      smsNotifications,
      betConfirmations,
      winLossUpdates,
      promotionalOffers,
      favoritesSports,
      favoritesTeams
    } = req.body

    const preferences = {
      defaultStake: parseFloat(defaultStake) || 10.00,
      quickStakeAmounts: Array.isArray(quickStakeAmounts) ? quickStakeAmounts : [5.00, 10.00, 25.00, 50.00, 100.00],
      oddsFormat: ['decimal', 'fractional', 'american'].includes(oddsFormat) ? oddsFormat : 'decimal',
      autoAcceptOddsChanges: Boolean(autoAcceptOddsChanges),
      enableNotifications: Boolean(enableNotifications),
      emailNotifications: Boolean(emailNotifications),
      smsNotifications: Boolean(smsNotifications),
      betConfirmations: Boolean(betConfirmations),
      winLossUpdates: Boolean(winLossUpdates),
      promotionalOffers: Boolean(promotionalOffers),
      favoritesSports: Array.isArray(favoritesSports) ? favoritesSports : [],
      favoritesTeams: Array.isArray(favoritesTeams) ? favoritesTeams : []
    }

    await user.update({
      preferences: JSON.stringify(preferences)
    })

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences
    })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * PUT /api/user/password - Change user password
 */
router.put('/password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match password')
    }
    return true
  })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }

  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const { currentPassword, newPassword } = req.body

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await user.update({
      password_hash: hashedNewPassword,
      password_changed_at: new Date()
    })

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * GET /api/user/security - Get security settings
 */
router.get('/security', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'Security settings retrieved successfully',
      data: {
        emailVerified: user.email_verified || false,
        phoneVerified: user.phone_verified || false,
        twoFactorEnabled: user.two_factor_enabled || false,
        passwordChangedAt: user.password_changed_at,
        lastLoginAt: user.last_login_at,
        accountLocked: user.account_locked || false,
        loginAttempts: user.login_attempts || 0
      }
    })
  } catch (error) {
    console.error('Error fetching security settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * GET /api/user/sessions - Get active user sessions
 */
router.get('/sessions', auth, async (req, res) => {
  try {
    // For production: implement actual session tracking
    // Currently returning minimal session info
    const currentSession = {
      id: 'current',
      created_at: new Date().toISOString(),
      ip_address: req.ip || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
      is_current: true
    };

    res.json({
      success: true,
      data: {
        sessions: [currentSession]
      }
    });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user sessions'
    });
  }
});

module.exports = router
