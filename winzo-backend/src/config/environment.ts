/**
 * Environment Configuration
 * 
 * Centralized configuration management for the Winzo backend application.
 * Loads and validates environment variables with sensible defaults.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Configuration interface
 */
interface Config {
    env: string;
    port: number;
    host: string;
    
    database: {
        url: string;
        poolMin: number;
        poolMax: number;
    };
    
    redis: {
        url: string;
        password?: string;
        db: number;
    };
    
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    
    encryption: {
        key: string;
        saltRounds: number;
    };
    
    api: {
        version: string;
        prefix: string;
    };
    
    cors: {
        origin: string[];
    };
    
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    
    upload: {
        maxFileSize: number;
        uploadPath: string;
    };
    
    email: {
        smtp: {
            host: string;
            port: number;
            user: string;
            password: string;
        };
        from: {
            email: string;
            name: string;
        };
    };
    
    payments: {
        stripe: {
            publicKey: string;
            secretKey: string;
            webhookSecret: string;
        };
    };
    
    externalApis: {
        sportsData: {
            apiKey: string;
            baseUrl: string;
        };
    };
    
    logging: {
        level: string;
        filePath: string;
        maxSize: string;
        maxFiles: string;
    };
    
    security: {
        cookieSecret: string;
        sessionSecret: string;
        csrfSecret: string;
    };
    
    websocket: {
        corsOrigin: string[];
        path: string;
    };
    
    health: {
        checkPath: string;
        metricsPath: string;
    };
    
    development: {
        debugSql: boolean;
        debugRoutes: boolean;
    };
}

/**
 * Parse environment variable as number with default
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse environment variable as boolean with default
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
}

/**
 * Parse comma-separated string into array
 */
function parseArray(value: string | undefined, defaultValue: string[] = []): string[] {
    if (!value) return defaultValue;
    return value.split(',').map(item => item.trim()).filter(Boolean);
}

/**
 * Validate required environment variables
 */
function validateRequiredEnvVars(): void {
    const required = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'ENCRYPTION_KEY',
        'DATABASE_URL'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Validate JWT secrets are different
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
    }
    
    // Validate encryption key length
    if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
}

/**
 * Create configuration object
 */
function createConfig(): Config {
    // Validate required environment variables
    if (process.env.NODE_ENV !== 'test') {
        validateRequiredEnvVars();
    }
    
    return {
        env: process.env.NODE_ENV || 'development',
        port: parseNumber(process.env.PORT, 3000),
        host: process.env.HOST || 'localhost',
        
        database: {
            url: process.env.DATABASE_URL || 'postgresql://localhost:5432/winzo_dev',
            poolMin: parseNumber(process.env.DATABASE_POOL_MIN, 2),
            poolMax: parseNumber(process.env.DATABASE_POOL_MAX, 10),
        },
        
        redis: {
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            password: process.env.REDIS_PASSWORD,
            db: parseNumber(process.env.REDIS_DB, 0),
        },
        
        jwt: {
            secret: process.env.JWT_SECRET || 'dev-jwt-secret',
            refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
            expiresIn: process.env.JWT_EXPIRE_TIME || '15m',
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE_TIME || '7d',
        },
        
        encryption: {
            key: process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-characters',
            saltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
        },
        
        api: {
            version: process.env.API_VERSION || 'v1',
            prefix: process.env.API_PREFIX || '/api/v1',
        },
        
        cors: {
            origin: parseArray(process.env.CORS_ORIGIN, ['http://localhost:3000']),
        },
        
        rateLimit: {
            windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
            maxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
        },
        
        upload: {
            maxFileSize: parseNumber(process.env.MAX_FILE_SIZE, 5 * 1024 * 1024), // 5MB
            uploadPath: process.env.UPLOAD_PATH || './uploads',
        },
        
        email: {
            smtp: {
                host: process.env.SMTP_HOST || 'localhost',
                port: parseNumber(process.env.SMTP_PORT, 587),
                user: process.env.SMTP_USER || '',
                password: process.env.SMTP_PASSWORD || '',
            },
            from: {
                email: process.env.FROM_EMAIL || 'noreply@winzo.app',
                name: process.env.FROM_NAME || 'Winzo Sports Betting',
            },
        },
        
        payments: {
            stripe: {
                publicKey: process.env.STRIPE_PUBLIC_KEY || '',
                secretKey: process.env.STRIPE_SECRET_KEY || '',
                webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
            },
        },
        
        externalApis: {
            sportsData: {
                apiKey: process.env.SPORTS_DATA_API_KEY || '',
                baseUrl: process.env.SPORTS_DATA_BASE_URL || 'https://api.sportsdata.io',
            },
        },
        
        logging: {
            level: process.env.LOG_LEVEL || 'info',
            filePath: process.env.LOG_FILE_PATH || './logs',
            maxSize: process.env.LOG_MAX_SIZE || '20m',
            maxFiles: process.env.LOG_MAX_FILES || '14d',
        },
        
        security: {
            cookieSecret: process.env.COOKIE_SECRET || 'dev-cookie-secret',
            sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
            csrfSecret: process.env.CSRF_SECRET || 'dev-csrf-secret',
        },
        
        websocket: {
            corsOrigin: parseArray(process.env.WEBSOCKET_CORS_ORIGIN, ['http://localhost:3000']),
            path: process.env.WEBSOCKET_PATH || '/socket.io',
        },
        
        health: {
            checkPath: process.env.HEALTH_CHECK_PATH || '/health',
            metricsPath: process.env.METRICS_PATH || '/metrics',
        },
        
        development: {
            debugSql: parseBoolean(process.env.DEBUG_SQL, false),
            debugRoutes: parseBoolean(process.env.DEBUG_ROUTES, false),
        },
    };
}

/**
 * Export configuration
 */
export const config = createConfig();

/**
 * Export configuration validation function for testing
 */
export { validateRequiredEnvVars };

/**
 * Configuration summary for logging
 */
export const configSummary = {
    environment: config.env,
    port: config.port,
    host: config.host,
    apiPrefix: config.api.prefix,
    databaseConfigured: !!config.database.url,
    redisConfigured: !!config.redis.url,
    emailConfigured: !!config.email.smtp.host && !!config.email.smtp.user,
    paymentsConfigured: !!config.payments.stripe.secretKey,
    sportsDataConfigured: !!config.externalApis.sportsData.apiKey,
};

