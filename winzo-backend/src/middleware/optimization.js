const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Enhanced compression middleware with security considerations
const compressionMiddleware = compression({
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Don't compress images or already compressed content
    const contentType = res.getHeader('content-type');
    if (contentType && (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/zip') ||
      contentType.includes('application/gzip')
    )) {
      return false;
    }
    
    return compression.filter(req, res);
  },
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress files larger than 1KB
  memLevel: 8, // Memory usage optimization
});

// Enhanced security middleware with bank-level protections
const securityMiddleware = helmet({
  // Content Security Policy with strict rules for WINZO
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      
      // Scripts: Only allow from self and specific trusted sources
      scriptSrc: [
        "'self'",
        "'strict-dynamic'",
        "'nonce-winzo-security'"
      ],
      
      // Styles: More restrictive, remove unsafe-inline
      styleSrc: [
        "'self'",
        "'nonce-winzo-security'",
        "https://fonts.googleapis.com"
      ],
      
      // Images: Allow from self, data URLs, and trusted CDNs
      imgSrc: [
        "'self'", 
        "data:", 
        "https://winzo-assets.s3.amazonaws.com",
        "https://secure.gravatar.com"
      ],
      
      // Fonts: Allow from trusted sources
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      
      // API connections: Restrict to specific endpoints
      connectSrc: [
        "'self'", 
        "https://api.the-odds-api.com",
        "https://winzo-api.railway.app",
        process.env.NODE_ENV === 'development' ? 'http://localhost:*' : null
      ].filter(Boolean),
      
      // Media sources
      mediaSrc: ["'self'"],
      
      // Object sources (disable plugins)
      objectSrc: ["'none'"],
      
      // Base URI restriction
      baseUri: ["'self'"],
      
      // Form action restriction
      formAction: ["'self'"],
      
      // Frame ancestors (prevent clickjacking)
      frameAncestors: ["'none'"],
      
      // Block mixed content
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      
      // Report violations in production
      reportUri: process.env.CSP_REPORT_URI || null
    },
    reportOnly: process.env.NODE_ENV === 'development'
  },
  
  // Enhanced security headers
  crossOriginEmbedderPolicy: false, // Disabled for compatibility
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // DNS prefetch control
  dnsPrefetchControl: { allow: false },
  
  // Frameguard (prevent clickjacking)
  frameguard: { action: 'deny' },
  
  // Hide powered by header
  hidePoweredBy: true,
  
  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // IE no open
  ieNoOpen: true,
  
  // MIME type sniffing prevention
  noSniff: true,
  
  // Referrer policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  
  // XSS filter
  xssFilter: true,
  
  // Additional security headers
  permittedCrossDomainPolicies: false,
  expectCt: {
    maxAge: 86400,
    enforce: true,
    reportUri: process.env.EXPECT_CT_REPORT_URI || null
  }
});

// Enhanced rate limiting with IP-based protection
const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.API_RATE_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT) || 100, // requests per window
  
  // Custom message with security context
  message: {
    success: false,
    error: 'Rate limit exceeded. Please reduce your request frequency.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil((parseInt(process.env.API_RATE_WINDOW) || 15 * 60 * 1000) / 1000)
  },
  
  // Enhanced headers
  standardHeaders: true,
  legacyHeaders: false,
  
  // Skip certain endpoints
  skip: (req) => {
    return req.path === '/health' || 
           req.path === '/api/health' ||
           (req.method === 'OPTIONS');
  },
  
  // Custom key generator for better tracking
  keyGenerator: (req) => {
    return req.ip + ':' + (req.get('User-Agent') || 'unknown').substring(0, 50);
  },
  
  // Handler for when limit is exceeded
  onLimitReached: (req, res) => {
    console.warn(`🚨 Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// Stricter API rate limiting for sensitive endpoints
const apiRateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute (reduced from 60)
  
  message: {
    success: false,
    error: 'API rate limit exceeded. Please wait before making more requests.',
    code: 'API_RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  },
  
  skip: (req) => {
    return req.path === '/health' || 
           req.path === '/api/health' ||
           (req.method === 'OPTIONS');
  },
  
  keyGenerator: (req) => {
    return req.ip + ':api';
  }
});

// Request size limiting middleware
const requestSizeLimitMiddleware = (req, res, next) => {
  const maxSize = parseInt(process.env.MAX_REQUEST_SIZE) || 1024 * 1024; // 1MB default
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    console.warn(`🚨 Request too large from IP: ${req.ip}, Size: ${req.headers['content-length']}`);
    return res.status(413).json({
      success: false,
      error: 'Request entity too large',
      code: 'REQUEST_TOO_LARGE',
      maxSize: maxSize
    });
  }
  
  next();
};

// CSRF protection middleware (simplified implementation)
const csrfProtectionMiddleware = (req, res, next) => {
  // Skip CSRF for safe methods and specific endpoints
  if (req.method === 'GET' || 
      req.method === 'HEAD' || 
      req.method === 'OPTIONS' ||
      req.path === '/health' ||
      req.path === '/api/health') {
    return next();
  }
  
  // Check for CSRF token in headers
  const csrfToken = req.get('X-CSRF-Token') || req.get('X-Requested-With');
  
  if (!csrfToken) {
    console.warn(`🚨 CSRF protection triggered for IP: ${req.ip}, Path: ${req.path}`);
    return res.status(403).json({
      success: false,
      error: 'CSRF protection: Missing required headers',
      code: 'CSRF_TOKEN_MISSING'
    });
  }
  
  // For API requests, require specific header
  if (req.path.startsWith('/api/') && csrfToken !== 'XMLHttpRequest') {
    return res.status(403).json({
      success: false,
      error: 'CSRF protection: Invalid request source',
      code: 'CSRF_INVALID_SOURCE'
    });
  }
  
  next();
};

// Enhanced request logging middleware with security events
const requestLoggingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Security monitoring
  const suspiciousPatterns = [
    /\.\./g, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /on\w+\s*=/i // Event handler injection
  ];
  
  const requestData = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));
  
  if (isSuspicious) {
    console.warn(`🚨 SUSPICIOUS REQUEST from ${req.ip}: ${req.method} ${req.url}`);
    // In production, alert security team
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')?.substring(0, 100),
      timestamp: new Date().toISOString(),
      suspicious: isSuspicious
    };
    
    if (process.env.NODE_ENV !== 'test') {
      const logLevel = res.statusCode >= 400 ? '❌' : '✅';
      console.log(`${logLevel} ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
      
      if (isSuspicious || res.statusCode >= 400) {
        console.log(`🔍 Detailed log: ${JSON.stringify(logData)}`);
      }
    }
  });
  
  next();
};

// Enhanced error handling middleware with security considerations
const errorHandlingMiddleware = (err, req, res, next) => {
  // Log error with security context
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 100)
  };
  
  console.error('🚨 SERVER ERROR:', JSON.stringify(errorLog));
  
  // Determine if this is a security-related error
  const securityErrors = [
    'JsonWebTokenError',
    'TokenExpiredError',
    'ValidationError',
    'CastError'
  ];
  
  const isSecurityError = securityErrors.includes(err.name) || 
                         err.message.includes('authentication') ||
                         err.message.includes('authorization');
  
  if (isSecurityError) {
    console.warn(`🔒 SECURITY ERROR from ${req.ip}: ${err.message}`);
  }
  
  // Don't expose sensitive information in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Default error response
  let status = err.status || err.statusCode || 500;
  let message = 'Internal server error';
  let code = 'SERVER_ERROR';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Invalid request data';
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Authentication failed';
    code = 'AUTH_ERROR';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'File too large';
    code = 'FILE_TOO_LARGE';
  }
  
  const errorResponse = {
    success: false,
    error: isDevelopment ? err.message : message,
    code: code,
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  };
  
  // Include stack trace only in development
  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      originalMessage: err.message
    };
  }
  
  res.status(status).json(errorResponse);
};

// Security headers middleware for additional protection
const additionalSecurityHeaders = (req, res, next) => {
  // Prevent page caching for sensitive endpoints
  if (req.path.includes('/api/auth') || req.path.includes('/api/wallet')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
  }
  
  // Add additional security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none'
  });
  
  next();
};

module.exports = {
  compressionMiddleware,
  securityMiddleware,
  rateLimitMiddleware,
  apiRateLimitMiddleware,
  requestLoggingMiddleware,
  errorHandlingMiddleware,
  requestSizeLimitMiddleware,
  csrfProtectionMiddleware,
  additionalSecurityHeaders
};
