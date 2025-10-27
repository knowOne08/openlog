import { securityHeaders, sanitizeInput } from '../config/security.js';

// Security headers middleware
export const addSecurityHeaders = (req, res, next) => {
    // Add security headers
    Object.entries(securityHeaders).forEach(([header, value]) => {
        res.setHeader(header, value);
    });

    // Remove server signature
    res.removeHeader('X-Powered-By');

    next();
};

// Input sanitization middleware
export const sanitizeRequest = (req, res, next) => {
    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeInput(req.query[key]);
            }
        });
    }

    // Sanitize body parameters (except for file uploads)
    if (req.body && !req.file && !req.files) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeInput(req.body[key]);
            }
        });
    }

    next();
};

// File upload validation middleware
export const validateFileUpload = (req, res, next) => {
    if (req.file) {
        const { fileSecurityConfig } = require('../config/security.js');

        // Check file size
        if (req.file.size > fileSecurityConfig.maxFileSize) {
            return res.status(400).json({
                success: false,
                error: 'File size exceeds limit'
            });
        }

        // Check MIME type
        if (!fileSecurityConfig.allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                error: 'File type not allowed'
            });
        }

        // Check file extension
        const fileExtension = '.' + req.file.originalname.split('.').pop().toLowerCase();
        if (fileSecurityConfig.blockedExtensions.includes(fileExtension)) {
            return res.status(400).json({
                success: false,
                error: 'File extension not allowed'
            });
        }
    }

    next();
};