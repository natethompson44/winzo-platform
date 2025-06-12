const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
});

// Security middleware
const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.the-odds-api.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting
const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.API_RATE_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT) || 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API-specific rate limiting
const apiRateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: 'API rate limit exceeded. Please slow down your requests.',
  },
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health';
  },
});

// Request logging middleware
const requestLoggingMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
};

// Error handling middleware
const errorHandlingMiddleware = (err, req, res, next) => {
  console.error('Error:', err);
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
};

module.exports = {
  compressionMiddleware,
  securityMiddleware,
  rateLimitMiddleware,
  apiRateLimitMiddleware,
  requestLoggingMiddleware,
  errorHandlingMiddleware,
};
