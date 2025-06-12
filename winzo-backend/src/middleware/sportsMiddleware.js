/**
 * Middleware for sports routes
 */
const oddsApiService = require('../services/oddsApiService');

/**
 * Check API quota before making requests
 */
function checkQuota(req, res, next) {
  const quota = oddsApiService.getQuotaStatus();
  if (quota.remaining <= 0) {
    return res.status(429).json({
      success: false,
      error: 'API quota exceeded',
      quota: quota,
      message: 'Please try again later when quota resets'
    });
  }
  if (oddsApiService.isQuotaLow()) {
    console.warn(`⚠ API quota running low: ${quota.remaining} requests remaining`);
  }
  next();
}

/**
 * Add CORS headers for sports API
 */
function addCorsHeaders(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}

/**
 * Log API requests for monitoring
 */
function logApiRequest(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
}

/**
 * Validate sport parameter
 */
function validateSportParam(req, res, next) {
  const { sport } = req.params;
  if (!sport || typeof sport !== 'string' || sport.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Sport parameter is required'
    });
  }
  if (!/^[a-z0-9_]+$/.test(sport)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sport parameter format'
    });
  }
  next();
}

module.exports = {
  checkQuota,
  addCorsHeaders,
  logApiRequest,
  validateSportParam
};
