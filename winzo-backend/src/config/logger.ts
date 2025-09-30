/**
 * Logging Configuration
 * 
 * Winston-based logging configuration with file rotation,
 * different log levels, and structured logging for the Winzo platform.
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { config } from './environment';

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

/**
 * Console format for development
 */
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        
        // Add metadata if present
        if (Object.keys(meta).length > 0) {
            msg += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return msg;
    })
);

/**
 * Create transports array
 */
const transports: winston.transport[] = [];

// Console transport for development
if (config.env === 'development' || config.env === 'test') {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat,
            level: config.logging.level,
        })
    );
}

// File transports for production
if (config.env !== 'test') {
    // Ensure log directory exists
    const logDir = path.resolve(config.logging.filePath);
    
    // Combined log file
    transports.push(
        new DailyRotateFile({
            filename: path.join(logDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles,
            format: logFormat,
            level: config.logging.level,
        })
    );
    
    // Error log file
    transports.push(
        new DailyRotateFile({
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles,
            format: logFormat,
            level: 'error',
        })
    );
    
    // Access log file for HTTP requests
    transports.push(
        new DailyRotateFile({
            filename: path.join(logDir, 'access-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles,
            format: logFormat,
            level: 'http',
        })
    );
}

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    defaultMeta: {
        service: 'winzo-backend',
        environment: config.env,
        version: process.env.npm_package_version || '1.0.0',
    },
    transports,
    exitOnError: false,
});

/**
 * Create specialized loggers for different components
 */

/**
 * Database logger
 */
export const dbLogger = logger.child({
    component: 'database',
});

/**
 * Authentication logger
 */
export const authLogger = logger.child({
    component: 'authentication',
});

/**
 * Betting logger for transaction tracking
 */
export const bettingLogger = logger.child({
    component: 'betting',
});

/**
 * Payment logger for financial transactions
 */
export const paymentLogger = logger.child({
    component: 'payments',
});

/**
 * WebSocket logger
 */
export const wsLogger = logger.child({
    component: 'websocket',
});

/**
 * Security logger for security events
 */
export const securityLogger = logger.child({
    component: 'security',
});

/**
 * API logger for request/response logging
 */
export const apiLogger = logger.child({
    component: 'api',
});

/**
 * External API logger
 */
export const externalApiLogger = logger.child({
    component: 'external-api',
});

/**
 * Log levels for reference
 */
export const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    HTTP: 'http',
    VERBOSE: 'verbose',
    DEBUG: 'debug',
    SILLY: 'silly',
} as const;

/**
 * Helper functions for structured logging
 */

/**
 * Log user action with context
 */
export const logUserAction = (
    userId: string,
    action: string,
    details: Record<string, any> = {},
    level: keyof typeof LOG_LEVELS = 'INFO'
) => {
    logger.log(LOG_LEVELS[level], `User action: ${action}`, {
        userId,
        action,
        ...details,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Log betting transaction
 */
export const logBettingTransaction = (
    userId: string,
    betId: string,
    action: string,
    amount?: number,
    details: Record<string, any> = {}
) => {
    bettingLogger.info(`Betting transaction: ${action}`, {
        userId,
        betId,
        action,
        amount,
        ...details,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Log payment transaction
 */
export const logPaymentTransaction = (
    userId: string,
    transactionId: string,
    type: string,
    amount: number,
    status: string,
    details: Record<string, any> = {}
) => {
    paymentLogger.info(`Payment transaction: ${type}`, {
        userId,
        transactionId,
        type,
        amount,
        status,
        ...details,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Log security event
 */
export const logSecurityEvent = (
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any> = {}
) => {
    const logLevel = severity === 'critical' || severity === 'high' ? 'error' : 
                    severity === 'medium' ? 'warn' : 'info';
    
    securityLogger.log(logLevel, `Security event: ${event}`, {
        event,
        severity,
        ...details,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Log API request/response
 */
export const logApiRequest = (
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
    details: Record<string, any> = {}
) => {
    apiLogger.http('API Request', {
        method,
        url,
        statusCode,
        responseTime,
        userId,
        ...details,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Log external API call
 */
export const logExternalApiCall = (
    service: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    success: boolean,
    details: Record<string, any> = {}
) => {
    externalApiLogger.info(`External API call: ${service}`, {
        service,
        endpoint,
        method,
        statusCode,
        responseTime,
        success,
        ...details,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Performance monitoring helper
 */
export class PerformanceTimer {
    private startTime: number;
    private operation: string;
    private metadata: Record<string, any>;

    constructor(operation: string, metadata: Record<string, any> = {}) {
        this.startTime = Date.now();
        this.operation = operation;
        this.metadata = metadata;
    }

    end(additionalMetadata: Record<string, any> = {}): number {
        const duration = Date.now() - this.startTime;
        
        logger.debug(`Performance: ${this.operation}`, {
            operation: this.operation,
            duration,
            ...this.metadata,
            ...additionalMetadata,
        });

        return duration;
    }
}

/**
 * Error logging helper
 */
export const logError = (
    error: Error,
    context: string,
    metadata: Record<string, any> = {}
) => {
    logger.error(`Error in ${context}: ${error.message}`, {
        context,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        ...metadata,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Initialize logger on startup
 */
export const initializeLogger = () => {
    logger.info('Logger initialized', {
        level: config.logging.level,
        environment: config.env,
        logPath: config.logging.filePath,
    });
    
    // Handle uncaught exceptions
    logger.exceptions.handle(
        new winston.transports.File({ 
            filename: path.join(config.logging.filePath, 'exceptions.log'),
            format: logFormat,
        })
    );
    
    // Handle unhandled promise rejections
    logger.rejections.handle(
        new winston.transports.File({ 
            filename: path.join(config.logging.filePath, 'rejections.log'),
            format: logFormat,
        })
    );
};

