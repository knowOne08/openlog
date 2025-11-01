import { Router } from 'express';
import multer, { memoryStorage } from 'multer';
import { handleFileMetaData, handleLinkMetadata } from '../controllers/logic.js';

const upload = multer({ storage: memoryStorage() });
const router = Router();

// POST /api/v1/upload/file
router.post('/file', upload.single('file'), async (req, res) => {
    const requestStartTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
        const { title, description, owner_id, visibility, tags } = req.body;
        console.log(`📥 [${requestId}] File upload request: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)}KB)`);
        
        
        const uploadRecord = await handleFileMetaData({
            title,
            description,
            file: req.file,
            ownerId: owner_id,
            visibility,
            tags: tags
        });
        
        const responseTime = Date.now() - requestStartTime;
        
        console.log(`✅ [${requestId}] Upload completed successfully in ${responseTime}ms`);
        
        res.json({ 
            success: true, 
            upload: {
                ...uploadRecord,
                performance: {
                    ...uploadRecord.performance,
                    totalResponseTime: responseTime
                }
            },
            requestId
        });
        
    } catch (err) {
        const responseTime = Date.now() - requestStartTime;
        
        // Log error server-side with request context
        console.error(`❌ [${requestId}] File upload error after ${responseTime}ms:`, err.message);
        
        // Determine error type and status code
        let statusCode = 500;
        let errorCode = 'INTERNAL_ERROR';
        
        if (err.message.includes('Validation Error')) {
            statusCode = 400;
            errorCode = 'VALIDATION_ERROR';
        } else if (err.message.includes('Failed to upload file to storage')) {
            statusCode = 503;
            errorCode = 'STORAGE_ERROR';
        } else if (err.message.includes('Failed to save metadata to database')) {
            statusCode = 503;
            errorCode = 'DATABASE_ERROR';
        } else if (err.message.includes('Failed to save search index')) {
            statusCode = 503;
            errorCode = 'SEARCH_INDEX_ERROR';
        } else if (err.message.includes('Failed to save tags')) {
            statusCode = 503;
            errorCode = 'TAG_ERROR';
        }
        
        res.status(statusCode).json({ 
            error: 'File upload failed',
            message: err.message,
            code: errorCode,
            requestId,
            performance: {
                responseTime
            }
        });
    }
});

// POST /api/v1/upload/link
router.post('/link', async (req, res) => {
    const requestStartTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
        const { title, description, url, owner_id, visibility, tags } = req.body;
        
        // Enhanced validation
        if (!title || !url || !owner_id || !visibility) {
            return res.status(400).json({ 
                error: 'Missing required fields: title, url, owner_id, or visibility',
                code: 'MISSING_FIELDS',
                requestId
            });
        }
        
        // Validate URL format
        try {
            new URL(url);
        } catch (urlError) {
            return res.status(400).json({
                error: 'Invalid URL format',
                code: 'INVALID_URL',
                requestId,
                providedUrl: url
            });
        }
        
        // Validate tags if provided
        if (tags) {
            try {
                const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
                if (!Array.isArray(parsedTags)) {
                    throw new Error('Tags must be an array');
                }
            } catch (tagError) {
                return res.status(400).json({
                    error: 'Invalid tags format. Must be a JSON array',
                    code: 'INVALID_TAGS',
                    requestId
                });
            }
        }
        
        console.log(`📥 [${requestId}] Link upload request: ${url}`);
        
        // Save link metadata
        const linkRecord = await handleLinkMetadata({
            title,
            description,
            url,
            ownerId: owner_id,
            visibility,
            tags: tags || [],
        });
        
        const responseTime = Date.now() - requestStartTime;
        
        console.log(`✅ [${requestId}] Link upload completed successfully in ${responseTime}ms`);
        
        res.json({ 
            success: true, 
            upload: {
                ...linkRecord,
                performance: {
                    ...linkRecord.performance,
                    totalResponseTime: responseTime
                }
            },
            requestId
        });
        
    } catch (err) {
        const responseTime = Date.now() - requestStartTime;
        
        // Log error server-side with request context
        console.error(`❌ [${requestId}] Link upload error after ${responseTime}ms:`, err.message);
        
        // Determine error type and status code
        let statusCode = 500;
        let errorCode = 'INTERNAL_ERROR';
        
        if (err.message.includes('Validation Error')) {
            statusCode = 400;
            errorCode = 'VALIDATION_ERROR';
        } else if (err.message.includes('Failed to save metadata to database')) {
            statusCode = 503;
            errorCode = 'DATABASE_ERROR';
        } else if (err.message.includes('Failed to save search index')) {
            statusCode = 503;
            errorCode = 'SEARCH_INDEX_ERROR';
        } else if (err.message.includes('Failed to save tags')) {
            statusCode = 503;
            errorCode = 'TAG_ERROR';
        }
        
        res.status(statusCode).json({ 
            error: 'Link upload failed',
            message: err.message,
            code: errorCode,
            requestId,
            performance: {
                responseTime
            }
        });
    }
});


export default router;
