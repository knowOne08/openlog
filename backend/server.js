// server.js
import 'dotenv/config';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { testConnection } from './config/db.js';

// Centralized logging configuration based on NODE_ENV
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Override console methods for production
if (isProduction) {
    // In production, disable console.log and console.debug
    console.log = () => { };
    console.debug = () => { };

    // Keep console.error and console.warn but sanitize them
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
        // Only log the first argument (message) and timestamp in production
        const message = typeof args[0] === 'string' ? args[0] : 'Error occurred';
        originalError(`[${new Date().toISOString()}] ${message}`);
    };

    console.warn = (...args) => {
        // Only log the first argument (message) and timestamp in production
        const message = typeof args[0] === 'string' ? args[0] : 'Warning occurred';
        originalWarn(`[${new Date().toISOString()}] ${message}`);
    };
} else if (isDevelopment) {
    // In development, enhance logging with timestamps
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalDebug = console.debug;

    console.log = (...args) => originalLog(`[${new Date().toISOString()}] [LOG]`, ...args);
    console.error = (...args) => originalError(`[${new Date().toISOString()}] [ERROR]`, ...args);
    console.warn = (...args) => originalWarn(`[${new Date().toISOString()}] [WARN]`, ...args);
    console.debug = (...args) => originalDebug(`[${new Date().toISOString()}] [DEBUG]`, ...args);
}

// Log startup information
console.log(`🚀 Server starting in ${process.env.NODE_ENV || 'development'} mode`);

const app = express();

// Environment validation
const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'JWT_SECRET',
    'PORT'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}

// CORS configuration
const corsOptions = {
    // origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Origin', 'Access-Control-Allow-Origin']
};

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.'
        }
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Global Middleware
import { transactionMonitor } from './middleware/transactionMonitor.js';

app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS
app.use(limiter); // Rate limiting
app.use(morgan(isProduction ? 'combined' : 'dev')); // Logging
app.use(json({ limit: '50mb' })); // JSON parsing with size limit
app.use(urlencoded({ extended: true, limit: '50mb' })); // URL encoded parsing
app.use(transactionMonitor); // Transaction monitoring

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'OpenLog API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// API Routes
import apiRoutes from './routes/index.js';

// Mount routes
app.use('/api/v1', apiRoutes);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'ROUTE_NOT_FOUND',
            message: `Route ${req.method} ${req.originalUrl} not found`,
            availableRoutes: [
                'GET /health',
                'GET /api/v1',
                'POST /api/v1/auth/signup',
                'POST /api/v1/auth/login',
                'GET /api/v1/auth/profile'
            ]
        }
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global Error Handler:', error);

    // Handle specific error types
    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            error: {
                code: 'PAYLOAD_TOO_LARGE',
                message: 'Request payload is too large'
            }
        });
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: error.message
            }
        });
    }

    // Default server error
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: isProduction
                ? 'Something went wrong on our end'
                : error.message
        }
    });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Start server
const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        // Test database connection
        console.log('🔍 Testing database connection...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ Database connection failed. Please check your Supabase configuration.');
            process.exit(1);
        }

        // Start the server
        const server = app.listen(PORT, () => {
            console.log('\n🚀 OpenLog API Server Started!');
            console.log(`📡 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📋 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API docs: http://localhost:${PORT}/api/v1`);
            console.log('\n📍 Available endpoints:');
            console.log(`   POST http://localhost:${PORT}/api/v1/auth/signup`);
            console.log(`   POST http://localhost:${PORT}/api/v1/auth/login`);
            console.log(`   GET  http://localhost:${PORT}/api/v1/auth/profile`);
            console.log(`   POST http://localhost:${PORT}/api/v1/auth/admin/create-member`);
            console.log('\n🎯 Ready to handle requests!\n');
        });

        // Store server instance for graceful shutdown
        global.server = server;

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

export default app;