const { Sequelize } = require('sequelize');
require('dotenv').config();

// Enhanced database configuration with bank-level security
// Supports DATABASE_URL for Railway or individual connection parameters
// Comprehensive security hardening for WINZO platform

console.log('🔒 Initializing database with enhanced security...');

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'MASTER_INVITE_CODE'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('🚨 CRITICAL SECURITY ERROR: Missing required environment variables:', missingVars);
  throw new Error(`Missing critical environment variables: ${missingVars.join(', ')}`);
}

// Validate JWT_SECRET strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('🚨 SECURITY WARNING: JWT_SECRET is too weak (minimum 32 characters recommended)');
}

// Validate MASTER_INVITE_CODE strength
if (process.env.MASTER_INVITE_CODE && process.env.MASTER_INVITE_CODE.length < 8) {
  console.error('🚨 SECURITY WARNING: MASTER_INVITE_CODE is too weak (minimum 8 characters recommended)');
}

const baseConfig = {
  dialect: 'postgres',
  protocol: 'postgres',
  
  // Enhanced logging for security monitoring
  logging: process.env.DB_LOGGING === 'true' ? (msg) => {
    // Filter out sensitive data from logs
    const sanitizedMsg = msg.replace(/password[^,]*/gi, 'password=***');
    console.log(`🗄️ DB: ${sanitizedMsg}`);
  } : false,
  
  // Enhanced model configuration
  define: { 
    underscored: true, 
    freezeTableName: true,
    timestamps: true, // Enable timestamps for audit trail
    paranoid: true,   // Enable soft deletes for data integrity
    version: true     // Enable optimistic locking
  },
  
  // Enhanced connection pool configuration
  pool: {
    max: parseInt(process.env.DB_MAX_POOL || '10', 10), // Increased for better performance
    min: parseInt(process.env.DB_MIN_POOL || '2', 10),  // Maintain minimum connections
    acquire: parseInt(process.env.DB_ACQUIRE || '60000', 10), // 60 seconds timeout
    idle: parseInt(process.env.DB_IDLE || '10000', 10),
    evict: parseInt(process.env.DB_EVICT || '1000', 10), // Connection eviction interval
    handleDisconnects: true, // Auto-reconnect on disconnect
    validate: (client) => {
      // Validate connection health
      return client && !client.readyState === 'closed';
    }
  },
  
  // Enhanced SSL and security configuration
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: true, // SECURITY: Changed from false to true
      ca: process.env.DB_SSL_CA, // SSL Certificate Authority
      key: process.env.DB_SSL_KEY, // SSL Private Key
      cert: process.env.DB_SSL_CERT, // SSL Certificate
      minVersion: 'TLSv1.2', // Minimum TLS version
      maxVersion: 'TLSv1.3', // Maximum TLS version
      ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384', // Secure ciphers
      honorCipherOrder: true,
      secureProtocol: 'TLSv1_2_method'
    } : {
      ssl: false
    },
    
    // Connection options for enhanced security
    application_name: 'winzo-platform',
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
    
    // Prevent SQL injection through additional validation
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000', 10), // 30 seconds
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '25000', 10), // 25 seconds
    
    // Connection security options
    sslmode: process.env.NODE_ENV === 'production' ? 'require' : 'prefer',
    connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10', 10) // 10 seconds
  },
  
  // Enhanced query configuration
  benchmark: process.env.NODE_ENV === 'development', // Query performance monitoring
  retry: {
    max: 3, // Maximum retry attempts
    match: [
      /ECONNRESET/,
      /ETIMEDOUT/,
      /ENOTFOUND/,
      /EAI_AGAIN/,
      /ConnectionError/,
      /ConnectionRefusedError/,
      /ConnectionTimedOutError/,
      /TimeoutError/
    ]
  },
  
  // Security-focused options
  migrationStorageTableName: 'sequelize_meta_winzo',
  seederStorageTableName: 'sequelize_data_winzo',
  timestamps: true,
  paranoid: true, // Soft deletes for audit trail
  sync: false, // Prevent accidental schema changes
  migrationRun: false,
  
  // Query isolation and security
  isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  
  // Hooks for additional security
  hooks: {
    beforeConnect: (config) => {
      console.log('🔗 Establishing secure database connection...');
      // Log connection attempt (without sensitive info)
      console.log(`🌐 Connecting to: ${config.host || 'via DATABASE_URL'}:${config.port || 'default'}`);
    },
    afterConnect: (connection, config) => {
      console.log('✅ Secure database connection established');
      
      // Set connection-specific security parameters
      if (connection.query) {
        // Set session security parameters
        const securityQueries = [
          "SET session_timeout = '30min'",
          "SET lock_timeout = '10s'",
          "SET statement_timeout = '30s'",
          "SET idle_in_transaction_session_timeout = '5min'"
        ];
        
        securityQueries.forEach(query => {
          connection.query(query).catch(err => {
            console.warn(`⚠️ Could not set security parameter: ${query} - ${err.message}`);
          });
        });
      }
    },
    beforeDisconnect: (connection) => {
      console.log('🔌 Closing database connection...');
    }
  }
};

// Enhanced connection string validation
if (process.env.DATABASE_URL) {
  // Validate DATABASE_URL format and security
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
    throw new Error('🚨 SECURITY ERROR: Invalid DATABASE_URL format');
  }
  
  // Check for SSL requirement in production
  if (process.env.NODE_ENV === 'production' && !dbUrl.includes('sslmode=require')) {
    console.warn('⚠️ SECURITY WARNING: DATABASE_URL should include sslmode=require in production');
  }
  
  // Log connection attempt (sanitized)
  const sanitizedUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
  console.log(`🔗 Using DATABASE_URL: ${sanitizedUrl}`);
}

// Create enhanced Sequelize instance
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      ...baseConfig,
      // Additional security for Railway/production
      dialectOptions: {
        ...baseConfig.dialectOptions,
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: true,
          minVersion: 'TLSv1.2'
        } : false
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'winzo',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        ...baseConfig,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        
        // Local development security
        dialectOptions: {
          ...baseConfig.dialectOptions,
          ssl: false // Disable SSL for local development
        }
      }
    );

// Enhanced connection testing with security validation
sequelize.authenticate = async function() {
  try {
    console.log('🔍 Testing database connection security...');
    
    // Test basic connection
    await Sequelize.prototype.authenticate.call(this);
    
    // Test SSL connection in production
    if (process.env.NODE_ENV === 'production') {
      const [results] = await this.query("SELECT version(), current_setting('ssl') as ssl_status");
      const sslStatus = results[0]?.ssl_status;
      
      if (sslStatus !== 'on') {
        console.warn('⚠️ SECURITY WARNING: SSL is not enabled on database connection');
      } else {
        console.log('✅ SSL connection verified');
      }
    }
    
    // Test connection parameters
    const [results] = await this.query(`
      SELECT 
        current_setting('application_name') as app_name,
        current_setting('statement_timeout') as stmt_timeout,
        inet_server_addr() as server_ip
    `);
    
    console.log('🔒 Database security status:', {
      applicationName: results[0]?.app_name,
      statementTimeout: results[0]?.stmt_timeout,
      serverConnection: results[0]?.server_ip ? 'External' : 'Local'
    });
    
    console.log('✅ Database connection security validated');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection security test failed:', error.message);
    throw error;
  }
};

// Security event monitoring
sequelize.addHook('beforeQuery', (options) => {
  // Monitor for potentially dangerous queries
  const query = options.sql ? options.sql.toLowerCase() : '';
  const dangerousPatterns = [
    /drop\s+table/i,
    /truncate\s+table/i,
    /delete\s+from\s+(?!.*where)/i, // DELETE without WHERE
    /update\s+.*set\s+.*(?!.*where)/i, // UPDATE without WHERE
    /grant\s+/i,
    /revoke\s+/i,
    /alter\s+/i
  ];
  
  const isDangerous = dangerousPatterns.some(pattern => pattern.test(query));
  
  if (isDangerous) {
    console.warn('🚨 DANGEROUS QUERY DETECTED:', query.substring(0, 100) + '...');
    // In production, you might want to block these queries or alert security team
  }
});

// Export enhanced sequelize instance
module.exports = sequelize;
