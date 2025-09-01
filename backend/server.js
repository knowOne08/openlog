// server.js
import 'dotenv/config';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { testConnection } from './config/db.js';

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
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
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
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS
app.use(limiter); // Rate limiting
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // Logging
app.use(json({ limit: '50mb' })); // JSON parsing with size limit
app.use(urlencoded({ extended: true, limit: '50mb' })); // URL encoded parsing

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'OpenLog API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
    });
});

// API Routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
// const searchRoutes = require('./routes/search');

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/upload', uploadRoutes);
// app.use('/api/v1/search', searchRoutes);

// API Documentation endpoint
app.get('/api/v1', (req, res) => {
    res.json({
        success: true,
        message: 'OpenLog API v1',
        endpoints: {
            health: 'GET /health',
            auth: {
                login: 'POST /api/v1/auth/login',
                refresh: 'POST /api/v1/auth/refresh',
                logout: 'POST /api/v1/auth/logout',
                profile: 'GET /api/v1/auth/profile',
                changePassword: 'POST /api/v1/auth/change-password',
                admin: {
                    createMember: 'POST /api/v1/auth/admin/create-member',
                    getMembers: 'GET /api/v1/auth/admin/members',
                    updateMemberStatus: 'PUT /api/v1/auth/admin/members/:userId/status'
                }
            },
            upload: {
                file: 'POST /api/v1/upload/file',
                link: 'POST /api/v1/upload/link'
            },
            // search: {
            //   query: 'GET /api/v1/search',
            //   suggestions: 'GET /api/v1/search/suggestions'
            // }
        },
        documentation: 'https://docs.openlog.com'
    });
});

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
            message: process.env.NODE_ENV === 'production'
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
const PORT = process.env.PORT || 3001;

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