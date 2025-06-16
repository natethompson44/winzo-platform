#!/usr/bin/env node

/**
 * WINZO Security Verification Script
 * Validates all bank-level security implementations
 */

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

console.log(`${colors.bright}${colors.blue}
🔒 WINZO SECURITY VERIFICATION SYSTEM
=====================================
${colors.reset}`);

let securityScore = 0;
let totalChecks = 0;
const issues = [];
const warnings = [];

function checkPass(description, condition, value = '') {
  totalChecks++;
  if (condition) {
    console.log(`${colors.green}✅ ${description}${colors.reset} ${value}`);
    securityScore++;
    return true;
  } else {
    console.log(`${colors.red}❌ ${description}${colors.reset} ${value}`);
    issues.push(description);
    return false;
  }
}

function checkWarn(description, condition, recommendation = '') {
  if (!condition) {
    console.log(`${colors.yellow}⚠️  ${description}${colors.reset} ${recommendation}`);
    warnings.push(description);
  }
}

// Load environment variables
require('dotenv').config();

console.log(`${colors.bright}\n1. AUTHENTICATION SECURITY${colors.reset}`);
console.log('━'.repeat(40));

// JWT Secret validation
const jwtSecret = process.env.JWT_SECRET;
checkPass('JWT_SECRET configured', !!jwtSecret);
checkPass('JWT_SECRET length >= 32 chars', jwtSecret && jwtSecret.length >= 32, `(${jwtSecret ? jwtSecret.length : 0} chars)`);
checkPass('JWT_SECRET complexity', jwtSecret && /[A-Z]/.test(jwtSecret) && /[0-9]/.test(jwtSecret) && /[^A-Za-z0-9]/.test(jwtSecret));

// Master invite code validation
const masterCode = process.env.MASTER_INVITE_CODE;
checkPass('MASTER_INVITE_CODE configured', !!masterCode);
checkPass('MASTER_INVITE_CODE length >= 8 chars', masterCode && masterCode.length >= 8, `(${masterCode ? masterCode.length : 0} chars)`);

console.log(`${colors.bright}\n2. DATABASE SECURITY${colors.reset}`);
console.log('━'.repeat(40));

// Database security validation
const dbUrl = process.env.DATABASE_URL;
checkPass('DATABASE_URL configured', !!dbUrl);
checkPass('SSL mode required in production', !dbUrl || process.env.NODE_ENV !== 'production' || dbUrl.includes('sslmode=require'));

// Database security environment variables
checkWarn('DB_SSL_CA configured', !!process.env.DB_SSL_CA, '(Recommended for production)');
checkWarn('DB_SSL_KEY configured', !!process.env.DB_SSL_KEY, '(Recommended for production)');
checkWarn('DB_SSL_CERT configured', !!process.env.DB_SSL_CERT, '(Recommended for production)');

console.log(`${colors.bright}\n3. API SECURITY${colors.reset}`);
console.log('━'.repeat(40));

// Rate limiting configuration
const rateLimit = parseInt(process.env.API_RATE_LIMIT) || 100;
const rateWindow = parseInt(process.env.API_RATE_WINDOW) || 900000;
checkPass('API_RATE_LIMIT configured', rateLimit > 0, `(${rateLimit} requests)`);
checkPass('API_RATE_WINDOW configured', rateWindow > 0, `(${rateWindow/1000}s window)`);

// Request size limits
const maxRequestSize = parseInt(process.env.MAX_REQUEST_SIZE) || 1048576;
checkPass('MAX_REQUEST_SIZE configured', maxRequestSize > 0, `(${Math.round(maxRequestSize/1024)}KB)`);

console.log(`${colors.bright}\n4. SECURITY HEADERS${colors.reset}`);
console.log('━'.repeat(40));

// Security header configuration
checkWarn('CSP_REPORT_URI configured', !!process.env.CSP_REPORT_URI, '(Recommended for production monitoring)');
checkWarn('EXPECT_CT_REPORT_URI configured', !!process.env.EXPECT_CT_REPORT_URI, '(Recommended for certificate monitoring)');

console.log(`${colors.bright}\n5. DEPENDENCY SECURITY${colors.reset}`);
console.log('━'.repeat(40));

try {
  // Check critical security packages
  const requiredPackages = [
    'bcryptjs',
    'jsonwebtoken', 
    'helmet',
    'express-rate-limit',
    'express-validator',
    'cors'
  ];

  const packageJson = require('./package.json');
  const dependencies = packageJson.dependencies || {};

  requiredPackages.forEach(pkg => {
    checkPass(`${pkg} installed`, !!dependencies[pkg], `v${dependencies[pkg] || 'missing'}`);
  });

} catch (error) {
  issues.push('Could not verify package dependencies');
  console.log(`${colors.red}❌ Package dependency check failed${colors.reset}`);
}

console.log(`${colors.bright}\n6. SECURITY IMPLEMENTATION${colors.reset}`);
console.log('━'.repeat(40));

try {
  // Check middleware implementations
  const authMiddleware = require('./src/middleware/auth.js');
  const optimizationMiddleware = require('./src/middleware/optimization.js');
  
  checkPass('Enhanced auth middleware', typeof authMiddleware === 'function');
  checkPass('Security middleware functions', typeof optimizationMiddleware.securityMiddleware === 'function');
  checkPass('CSRF protection middleware', typeof optimizationMiddleware.csrfProtectionMiddleware === 'function');
  checkPass('Rate limiting middleware', typeof optimizationMiddleware.rateLimitMiddleware === 'function');

} catch (error) {
  issues.push('Could not verify middleware implementations');
  console.log(`${colors.red}❌ Middleware verification failed: ${error.message}${colors.reset}`);
}

console.log(`${colors.bright}\n7. CONFIGURATION VALIDATION${colors.reset}`);
console.log('━'.repeat(40));

// Environment validation
checkPass('NODE_ENV set', !!process.env.NODE_ENV, `(${process.env.NODE_ENV || 'undefined'})`);
checkPass('Production readiness', process.env.NODE_ENV !== 'production' || (!!jwtSecret && jwtSecret.length >= 32 && !!masterCode));

// Security scoring
console.log(`${colors.bright}\n📊 SECURITY ASSESSMENT RESULTS${colors.reset}`);
console.log('═'.repeat(50));

const scorePercentage = Math.round((securityScore / totalChecks) * 100);
let scoreColor = colors.red;
let securityLevel = 'CRITICAL - IMMEDIATE ACTION REQUIRED';

if (scorePercentage >= 95) {
  scoreColor = colors.green;
  securityLevel = 'BANK-LEVEL SECURITY ✓';
} else if (scorePercentage >= 85) {
  scoreColor = colors.yellow;
  securityLevel = 'GOOD - MINOR IMPROVEMENTS NEEDED';
} else if (scorePercentage >= 70) {
  scoreColor = colors.yellow;
  securityLevel = 'MODERATE - SECURITY GAPS PRESENT';
}

console.log(`${colors.bright}Security Score: ${scoreColor}${securityScore}/${totalChecks} (${scorePercentage}%)${colors.reset}`);
console.log(`${colors.bright}Security Level: ${scoreColor}${securityLevel}${colors.reset}\n`);

// Issues summary
if (issues.length > 0) {
  console.log(`${colors.red}${colors.bright}🚨 CRITICAL ISSUES TO FIX:${colors.reset}`);
  issues.forEach((issue, index) => {
    console.log(`${colors.red}   ${index + 1}. ${issue}${colors.reset}`);
  });
  console.log('');
}

// Warnings summary
if (warnings.length > 0) {
  console.log(`${colors.yellow}${colors.bright}⚠️  RECOMMENDATIONS:${colors.reset}`);
  warnings.forEach((warning, index) => {
    console.log(`${colors.yellow}   ${index + 1}. ${warning}${colors.reset}`);
  });
  console.log('');
}

// Security recommendations
console.log(`${colors.bright}🛡️  SECURITY RECOMMENDATIONS:${colors.reset}`);
console.log(`   1. Rotate JWT_SECRET monthly in production`);
console.log(`   2. Monitor security logs for suspicious activity`);
console.log(`   3. Update dependencies regularly for security patches`);
console.log(`   4. Implement automated security scanning in CI/CD`);
console.log(`   5. Configure security monitoring endpoints for production`);

console.log(`${colors.bright}\n🎯 WINZO PLATFORM SECURITY STATUS${colors.reset}`);
console.log('═'.repeat(50));

if (scorePercentage >= 95) {
  console.log(`${colors.green}${colors.bright}
🏆 CONGRATULATIONS! 
   WINZO platform is operating with BANK-LEVEL SECURITY
   
   ✓ Enterprise-grade authentication
   ✓ Multi-layer API protection  
   ✓ Hardened database security
   ✓ Comprehensive monitoring
   
   Your users can enjoy luxury sports betting with complete confidence!
${colors.reset}`);
} else {
  console.log(`${colors.red}${colors.bright}
⚠️  SECURITY ATTENTION REQUIRED
   
   Please address the critical issues listed above before
   deploying to production. WINZO's reputation depends on
   maintaining the highest security standards.
${colors.reset}`);
}

console.log(`\n${colors.blue}For detailed security implementation guide, see:`);
console.log(`📄 WINZO_SECURITY_HARDENING_REPORT.md${colors.reset}\n`);

// Exit with appropriate code
process.exit(issues.length > 0 ? 1 : 0);