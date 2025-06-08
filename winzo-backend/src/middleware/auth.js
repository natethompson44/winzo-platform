const jwt = require('jsonwebtoken');

/**
 * Middleware that verifies JWT tokens present in the Authorization header.
 * If valid, the decoded user id is attached to the request object under
 * `req.user`. Unauthorized requests are rejected with a 401 status code.
 */
module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user id directly to the request so downstream
    // handlers can access `req.user` as the id value.
    req.user = payload.id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
