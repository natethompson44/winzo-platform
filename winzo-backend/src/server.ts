/**
 * Winzo Sports Betting Platform - Main Server Entry Point
 * 
 * This file initializes the Express server with all middleware, routes,
 * and services required for the sports betting platform.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from '@/config/environment';
import { logger } from '@/config/logger';
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimitMiddleware } from '@/middleware/rateLimit';
import { authMiddleware } from '@/middleware/auth';
import { validationMiddleware } from '@/middleware/validation';

// Route imports
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import sportsRoutes from '@/routes/sports';
import bettingRoutes from '@/routes/betting';
import paymentRoutes from '@/routes/payments';
import healthRoutes from '@/routes/health';

// WebSocket handler
import { initializeWebSocket } from '@/services/websocket';

// Graceful shutdown handler
import { gracefulShutdown } from '@/utils/shutdown';

/**
 * Create and configure Express application
 */
function createApp(): express.Application {
    const app = express();

    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "wss:", "ws:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    app.use(cors({
        origin: config.cors.origin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression and parsing middleware
    app.use(compression());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (config.env !== 'test') {
        app.use(morgan('combined', {
            stream: { write: (message: string) => logger.info(message.trim()) }
        }));
    }

    // Rate limiting
    app.use(rateLimitMiddleware);

    // Health check endpoint (before authentication)
    app.use('/health', healthRoutes);

    // API routes with authentication
    const apiRouter = express.Router();
    
    // Public routes (no authentication required)
    apiRouter.use('/auth', authRoutes);
    apiRouter.use('/sports', sportsRoutes); // Some sports endpoints are public
    
    // Protected routes (authentication required)
    apiRouter.use('/users', authMiddleware, userRoutes);
    apiRouter.use('/betting', authMiddleware, bettingRoutes);
    apiRouter.use('/payments', authMiddleware, paymentRoutes);

    // Mount API routes
    app.use(config.api.prefix, apiRouter);

    // API documentation
    if (config.env === 'development') {
        import('swagger-ui-express').then(swaggerUi => {
            import('@/config/swagger').then(({ swaggerSpec }) => {
                app.use('/docs', swaggerUi.default.serve, swaggerUi.default.setup(swaggerSpec));
                logger.info('API documentation available at /docs');
            });
        });
    }

    // 404 handler
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: 'Endpoint not found',
                timestamp: new Date().toISOString(),
                requestId: req.id || 'unknown'
            }
        });
    });

    // Global error handler (must be last)
    app.use(errorHandler);

    return app;
}

/**
 * Initialize server with all required services
 */
async function initializeServer(): Promise<{ app: express.Application; server: any; io: SocketIOServer }> {
    try {
        logger.info('🚀 Starting Winzo Backend Server...');

        // Connect to database
        await connectDatabase();
        logger.info('✅ Database connected successfully');

        // Connect to Redis
        await connectRedis();
        logger.info('✅ Redis connected successfully');

        // Create Express app
        const app = createApp();

        // Create HTTP server
        const server = createServer(app);

        // Initialize WebSocket server
        const io = initializeWebSocket(server);
        logger.info('✅ WebSocket server initialized');

        return { app, server, io };

    } catch (error) {
        logger.error('❌ Failed to initialize server:', error);
        process.exit(1);
    }
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
    const { app, server, io } = await initializeServer();

    // Start listening
    server.listen(config.port, config.host, () => {
        logger.info(`🎯 Server running on ${config.host}:${config.port}`);
        logger.info(`🌍 Environment: ${config.env}`);
        logger.info(`📡 API Base URL: http://${config.host}:${config.port}${config.api.prefix}`);
        
        if (config.env === 'development') {
            logger.info(`📚 API Docs: http://${config.host}:${config.port}/docs`);
        }
    });

    // Setup graceful shutdown
    gracefulShutdown(server, io);

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // Don't exit the process in production, just log the error
        if (config.env === 'development') {
            process.exit(1);
        }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
        logger.error('Uncaught Exception:', error);
        // Exit the process as the application is in an unknown state
        process.exit(1);
    });
}

// Start the server if this file is run directly
if (require.main === module) {
    startServer().catch((error) => {
        logger.error('Failed to start server:', error);
        process.exit(1);
    });
}

export { createApp, startServer };

