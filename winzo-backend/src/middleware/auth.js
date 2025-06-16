const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Enhanced authentication middleware with comprehensive security
class AuthSecurity {
  constructor() {
    this.failedAttempts = new Map();
    this.blacklistedTokens = new Set();
    this.maxFailedAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
  }

  // Track failed authentication attempts
  trackFailedAttempt(identifier) {
    const attempts = this.failedAttempts.get(identifier) || { count: 0, firstAttempt: Date.now() };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.failedAttempts.set(identifier, attempts);
    
    // Clean up old entries
    this.cleanupFailedAttempts();
  }

  // Check if identifier is locked out
  isLockedOut(identifier) {
    const attempts = this.failedAttempts.get(identifier);
    if (!attempts || attempts.count < this.maxFailedAttempts) return false;
    
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    if (timeSinceLastAttempt > this.lockoutDuration) {
      this.failedAttempts.delete(identifier);
      return false;
    }
    
    return true;
  }

  // Clean up expired failed attempts
  cleanupFailedAttempts() {
    const now = Date.now();
    for (const [key, attempts] of this.failedAttempts.entries()) {
      if (now - attempts.lastAttempt > this.lockoutDuration) {
        this.failedAttempts.delete(key);
      }
    }
  }

  // Add token to blacklist (for logout/security events)
  blacklistToken(token) {
    this.blacklistedTokens.add(token);
    // Clean up old tokens periodically
    if (this.blacklistedTokens.size > 1000) {
      this.blacklistedTokens.clear();
    }
  }

  // Reset failed attempts on successful auth
  resetFailedAttempts(identifier) {
    this.failedAttempts.delete(identifier);
  }
}

const authSecurity = new AuthSecurity();

// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + ':auth';
  }
});

/**
 * Enhanced middleware that verifies JWT tokens with comprehensive security measures.
 * Includes brute force protection, token blacklisting, and secure validation.
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract and validate JWT secret
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      console.error('🚨 SECURITY ALERT: JWT_SECRET is missing or too weak');
      return res.status(500).json({
        success: false,
        error: 'Authentication system configuration error.',
        code: 'AUTH_CONFIG_ERROR'
      });
    }

    // Extract token
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Invalid authorization format.',
        code: 'INVALID_AUTH_FORMAT'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Validate token format
    if (!token || token.length < 10) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token format.',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Check if token is blacklisted
    if (authSecurity.blacklistedTokens.has(token)) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Token has been revoked.',
        code: 'TOKEN_REVOKED'
      });
    }

    // Check for brute force attacks
    const clientIdentifier = req.ip + ':' + (req.get('User-Agent') || 'unknown');
    if (authSecurity.isLockedOut(clientIdentifier)) {
      return res.status(429).json({
        success: false,
        error: 'Account temporarily locked due to multiple failed attempts.',
        code: 'ACCOUNT_LOCKED',
        retryAfter: Math.ceil(authSecurity.lockoutDuration / 1000)
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Explicitly specify algorithm
      issuer: process.env.JWT_ISSUER || 'winzo-platform',
      maxAge: '7d'
    });

    // Validate decoded token structure
    if (!decoded.id && !decoded.userId) {
      authSecurity.trackFailedAttempt(clientIdentifier);
      return res.status(401).json({
        success: false,
        error: 'Invalid token payload.',
        code: 'INVALID_TOKEN_PAYLOAD'
      });
    }

    // Check token expiration with buffer
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now + 60) { // 1 minute buffer
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Reset failed attempts on successful auth
    authSecurity.resetFailedAttempts(clientIdentifier);

    // Attach user data to request
    req.user = {
      id: decoded.id || decoded.userId,
      username: decoded.username,
      tokenIssuedAt: decoded.iat,
      tokenExpiresAt: decoded.exp
    };

    // Add security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });

    next();
  } catch (error) {
    const clientIdentifier = req.ip + ':' + (req.get('User-Agent') || 'unknown');
    authSecurity.trackFailedAttempt(clientIdentifier);

    // Log security events
    console.warn(`🔒 Authentication failed for ${req.ip}: ${error.message}`);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token.',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token has expired.',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication failed.',
      code: 'AUTH_FAILED'
    });
  }
};

// Export enhanced auth middleware and utilities
module.exports = authMiddleware;
module.exports.authRateLimit = authRateLimit;
module.exports.authSecurity = authSecurity;
