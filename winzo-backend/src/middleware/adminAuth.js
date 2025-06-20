const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * Admin authentication middleware that verifies:
 * 1. Valid JWT token exists
 * 2. User exists in database
 * 3. User has admin role
 * 4. Account is active
 */
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id || decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      })
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Account is inactive.'
      })
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }

    next()
  } catch (error) {
    console.error('Admin auth error:', error)
    res.status(400).json({
      success: false,
      error: 'Invalid token.'
    })
  }
}

/**
 * Middleware that logs admin actions for audit trail
 */
const logAdminAction = (action) => {
  return (req, res, next) => {
    const originalSend = res.send
    
    res.send = function(data) {
      // Log the admin action
      console.log(`[ADMIN ACTION] User ${req.user.username} (ID: ${req.user.id}) performed: ${action}`, {
        timestamp: new Date().toISOString(),
        userId: req.user.id,
        username: req.user.username,
        action: action,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      })
      
      originalSend.call(this, data)
    }
    
    next()
  }
}

module.exports = {
  adminAuth,
  logAdminAction
} 