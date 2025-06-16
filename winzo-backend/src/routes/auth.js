const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sequelize } = require('../models');
const auth = require('../middleware/auth');
const { authRateLimit, authSecurity } = require('../middleware/auth');

const router = express.Router();

// Enhanced password validation for WINZO's bank-level security
const passwordValidation = [
  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain: uppercase, lowercase, number, and special character (@$!%*?&)')
    .not()
    .matches(/^(.)\1{2,}/)
    .withMessage('Password cannot contain more than 2 consecutive identical characters')
    .not()
    .isIn(['password', '12345678', 'qwerty123', 'password123', 'admin123'])
    .withMessage('Password is too common and not secure')
];

// Enhanced username validation
const usernameValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores')
    .not()
    .matches(/^(admin|root|test|winzo|support|api|null|undefined)$/i)
    .withMessage('Username is reserved and cannot be used')
];

/**
 * Generate a cryptographically secure invite code for new users.
 */
function generateSecureInviteCode() {
  const crypto = require('crypto');
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Enhanced JWT token generation with security features
 */
function generateSecureToken(user, req) {
  const payload = {
    id: user.id,
    username: user.username,
    iat: Math.floor(Date.now() / 1000),
    jti: require('crypto').randomUUID(), // JWT ID for token tracking
    iss: process.env.JWT_ISSUER || 'winzo-platform',
    aud: 'winzo-users',
    // Security context
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 100) || 'unknown'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h', // Reduced from 7d for better security
    algorithm: 'HS256'
  });
}

/**
 * Security audit logging
 */
function logSecurityEvent(eventType, details, req) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: eventType,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    ...details
  };
  
  console.log(`🔒 SECURITY EVENT: ${JSON.stringify(logEntry)}`);
  
  // In production, send to security monitoring system
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with security monitoring service
  }
}

// Apply rate limiting to auth routes
router.use(authRateLimit);

// Register a new user with enhanced security validation
router.post(
  '/register',
  [
    ...usernameValidation,
    ...passwordValidation,
    body('email')
      .optional()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('inviteCode')
      .notEmpty()
      .withMessage('Invite code is required')
      .isLength({ min: 6, max: 12 })
      .withMessage('Invalid invite code format')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logSecurityEvent('REGISTRATION_VALIDATION_FAILED', {
        errors: errors.array(),
        username: req.body.username
      }, req);
      
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        code: 'VALIDATION_FAILED'
      });
    }

    const { username, password, email, inviteCode } = req.body;
    const normalizedUsername = username.toLowerCase().trim();

    try {
      // Enhanced invite code validation
      const masterCode = process.env.MASTER_INVITE_CODE;
      if (!masterCode || masterCode.length < 8) {
        console.error('🚨 SECURITY ALERT: MASTER_INVITE_CODE is missing or too weak');
        return res.status(500).json({ 
          success: false,
          message: 'Registration system configuration error',
          code: 'CONFIG_ERROR'
        });
      }

      const inviter = await User.findOne({ 
        where: { inviteCode: inviteCode.toUpperCase() } 
      });
      
      if (inviteCode.toUpperCase() !== masterCode.toUpperCase() && !inviter) {
        logSecurityEvent('INVALID_INVITE_CODE', {
          inviteCode: inviteCode.substring(0, 3) + '***',
          username: normalizedUsername
        }, req);
        
        return res.status(400).json({ 
          success: false,
          message: 'Invalid or expired invite code',
          code: 'INVALID_INVITE_CODE'
        });
      }

      // Check for existing user with enhanced collision detection
      const existing = await User.findOne({
        where: sequelize.or(
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('username')),
            normalizedUsername
          ),
          email ? { email: email.toLowerCase() } : null
        ).filter(Boolean)
      });

      if (existing) {
        logSecurityEvent('DUPLICATE_REGISTRATION_ATTEMPT', {
          attemptedUsername: normalizedUsername,
          attemptedEmail: email,
          existingField: existing.username === normalizedUsername ? 'username' : 'email'
        }, req);
        
        return res.status(409).json({ 
          success: false,
          message: existing.username === normalizedUsername 
            ? 'Username already exists' 
            : 'Email already registered',
          code: 'DUPLICATE_USER'
        });
      }

      // Enhanced password hashing with higher cost
      const saltRounds = 14; // Increased from default 10
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user with security enhancements
      const newUser = await User.create({
        username: normalizedUsername,
        email: email ? email.toLowerCase() : null,
        password_hash: hashedPassword,
        wallet_balance: 100.00,
        inviteCode: generateSecureInviteCode(),
        is_active: true,
        created_at: new Date(),
        last_login: new Date(),
        failed_login_attempts: 0,
        account_locked_until: null
      });

      // Generate secure token
      const token = generateSecureToken(newUser, req);

      logSecurityEvent('USER_REGISTERED', {
        userId: newUser.id,
        username: newUser.username,
        invitedBy: inviter ? inviter.id : 'MASTER_CODE'
      }, req);

      res.status(201).json({ 
        success: true,
        message: 'Welcome to WINZO! Your account has been created successfully.',
        data: {
          token,
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            wallet_balance: newUser.wallet_balance,
            inviteCode: newUser.inviteCode
          }
        }
      });

    } catch (err) {
      console.error('Registration error:', err);
      logSecurityEvent('REGISTRATION_ERROR', {
        error: err.message,
        username: normalizedUsername
      }, req);
      
      res.status(500).json({ 
        success: false,
        message: 'Registration failed. Please try again.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Enhanced authentication with comprehensive security
router.post(
  '/login',
  [
    body('username')
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ max: 100 })
      .withMessage('Username too long'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ max: 200 })
      .withMessage('Password too long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        code: 'VALIDATION_FAILED'
      });
    }

    const { username, password } = req.body;
    const normalizedUsername = username.toLowerCase().trim();
    const clientIdentifier = req.ip + ':' + (req.get('User-Agent') || 'unknown');

    try {
      // Check for brute force protection
      if (authSecurity.isLockedOut(clientIdentifier)) {
        logSecurityEvent('LOGIN_BLOCKED_BRUTE_FORCE', {
          username: normalizedUsername,
          clientIdentifier: clientIdentifier.substring(0, 20) + '***'
        }, req);
        
        return res.status(429).json({ 
          success: false,
          message: 'Too many failed attempts. Account temporarily locked.',
          code: 'ACCOUNT_LOCKED',
          retryAfter: Math.ceil(authSecurity.lockoutDuration / 1000)
        });
      }

      // Find user with security checks
      const user = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('username')),
          normalizedUsername
        ),
      });

      if (!user) {
        authSecurity.trackFailedAttempt(clientIdentifier);
        logSecurityEvent('LOGIN_FAILED_USER_NOT_FOUND', {
          attemptedUsername: normalizedUsername
        }, req);
        
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials. Please check your username and password.',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if account is locked
      if (user.account_locked_until && new Date() < user.account_locked_until) {
        logSecurityEvent('LOGIN_BLOCKED_ACCOUNT_LOCKED', {
          userId: user.id,
          username: user.username,
          lockedUntil: user.account_locked_until
        }, req);
        
        return res.status(423).json({ 
          success: false,
          message: 'Account is locked. Please contact support.',
          code: 'ACCOUNT_LOCKED'
        });
      }

      // Check if account is active
      if (!user.is_active) {
        logSecurityEvent('LOGIN_BLOCKED_INACTIVE_ACCOUNT', {
          userId: user.id,
          username: user.username
        }, req);
        
        return res.status(403).json({ 
          success: false,
          message: 'Account is disabled. Please contact support.',
          code: 'ACCOUNT_DISABLED'
        });
      }

      // Verify password with timing attack protection
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        // Increment failed attempts
        const updatedFailedAttempts = (user.failed_login_attempts || 0) + 1;
        const shouldLockAccount = updatedFailedAttempts >= 5;
        
        await user.update({
          failed_login_attempts: updatedFailedAttempts,
          account_locked_until: shouldLockAccount 
            ? new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            : null
        });

        authSecurity.trackFailedAttempt(clientIdentifier);
        
        logSecurityEvent('LOGIN_FAILED_INVALID_PASSWORD', {
          userId: user.id,
          username: user.username,
          failedAttempts: updatedFailedAttempts,
          accountLocked: shouldLockAccount
        }, req);
        
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials. Please check your username and password.',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Successful login - reset failed attempts and update login info
      await user.update({
        failed_login_attempts: 0,
        account_locked_until: null,
        last_login: new Date(),
        last_ip: req.ip
      });

      // Reset brute force tracking
      authSecurity.resetFailedAttempts(clientIdentifier);

      // Generate secure token
      const token = generateSecureToken(user, req);

      logSecurityEvent('LOGIN_SUCCESS', {
        userId: user.id,
        username: user.username
      }, req);

      res.json({ 
        success: true,
        message: 'Welcome back to WINZO!',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            wallet_balance: user.wallet_balance,
            last_login: user.last_login
          }
        }
      });

    } catch (err) {
      console.error('Login error:', err);
      logSecurityEvent('LOGIN_ERROR', {
        error: err.message,
        username: normalizedUsername
      }, req);
      
      res.status(500).json({ 
        success: false,
        message: 'Login failed. Please try again.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Enhanced logout with token blacklisting
router.post('/logout', auth, async (req, res) => {
  try {
    const token = req.header('Authorization')?.substring(7);
    if (token) {
      authSecurity.blacklistToken(token);
    }

    logSecurityEvent('USER_LOGOUT', {
      userId: req.user.id,
      username: req.user.username
    }, req);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Logout failed',
      code: 'SERVER_ERROR'
    });
  }
});

// Enhanced user profile endpoint with security headers
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { 
        exclude: ['password_hash', 'failed_login_attempts', 'account_locked_until'] 
      },
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        wallet_balance: user.wallet_balance,
        is_active: user.is_active,
        created_at: user.created_at,
        last_login: user.last_login,
        inviteCode: user.inviteCode
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile',
      code: 'SERVER_ERROR'
    });
  }
});

// Security endpoint for password change
router.post('/change-password', 
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    ...passwordValidation
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        code: 'VALIDATION_FAILED'
      });
    }

    const { currentPassword, password: newPassword } = req.body;

    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verify current password
      const currentPasswordMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!currentPasswordMatch) {
        logSecurityEvent('PASSWORD_CHANGE_FAILED_INVALID_CURRENT', {
          userId: user.id,
          username: user.username
        }, req);
        
        return res.status(401).json({ 
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Check if new password is different
      const samePassword = await bcrypt.compare(newPassword, user.password_hash);
      if (samePassword) {
        return res.status(400).json({ 
          success: false,
          message: 'New password must be different from current password',
          code: 'SAME_PASSWORD'
        });
      }

      // Hash new password
      const saltRounds = 14;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await user.update({
        password_hash: hashedNewPassword,
        password_changed_at: new Date()
      });

      logSecurityEvent('PASSWORD_CHANGED', {
        userId: user.id,
        username: user.username
      }, req);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (err) {
      console.error('Password change error:', err);
      res.status(500).json({ 
        success: false,
        message: 'Password change failed',
        code: 'SERVER_ERROR'
      });
    }
  }
);

module.exports = router;
