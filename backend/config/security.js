// Security configuration for production deployment

// Secure logging utility - environment handled by server.js
export const secureLogger = {
    info: (message, data = null) => {
        console.log(`[SECURITY] ${message}`, data || '');
    },

    error: (message, error = null, sensitiveData = null) => {
        console.error(`[SECURITY] ${message}`, {
            error: error?.message,
            timestamp: new Date().toISOString()
        });
    },

    warn: (message, data = null) => {
        console.warn(`[SECURITY] ${message}`, data || '');
    },

    debug: (message, data = null) => {
        console.debug(`[SECURITY] ${message}`, data || '');
    }
};

// Environment check for production
const isProduction = process.env.NODE_ENV === 'production';

// Security headers configuration
export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    ...(isProduction && {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    })
};

// Rate limiting configuration
export const rateLimitConfig = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_REQUESTS) || (isProduction ? 100 : 1000), // Stricter in production
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later.'
        }
    }
};

// CORS configuration
export const corsConfig = {
    origin: isProduction
        ? process.env.CORS_ORIGINS?.split(',') || false // Strict origins in production
        : ['http://localhost:3000', 'http://localhost:3001'], // Allow dev origins
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

// Input validation and sanitization
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    // Remove potentially dangerous characters
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
};

// File upload security
export const fileSecurityConfig = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'text/plain', 'text/markdown',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4', 'video/avi'
    ],
    // Dangerous file extensions to block
    blockedExtensions: ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.sh']
};

// Environment variable validation
export const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'JWT_SECRET',
    'MINIO_ENDPOINT',
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
    'QDRANT_URL'
];

export const validateEnvironment = () => {
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        secureLogger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        if (isProduction) {
            process.exit(1);
        }
    }

    // Validate JWT secret strength in production
    if (isProduction && process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        secureLogger.error('JWT_SECRET must be at least 32 characters in production');
        process.exit(1);
    }

    return true;
};

export { isDevelopment, isProduction };