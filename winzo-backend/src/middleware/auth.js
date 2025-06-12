const jwt = require('jsonwebtoken');

/**
 * Middleware that verifies JWT tokens present in the Authorization header.
 * If valid, the decoded user id is attached to the request object under
 * `req.user`. Unauthorized requests are rejected with a 401 status code.
 */
module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id || decoded.userId,
      username: decoded.username
    };
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};
