import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import MinioService from './minioService.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.SERVICE_PORT || 3001;
const host = process.env.SERVICE_HOST || '0.0.0.0';

// Initialize MinIO service
const minioService = new MinioService();

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE?.replace('MB', '')) * 1024 * 1024 || 100 * 1024 * 1024, // 100MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['*/*'];
        
        if (allowedTypes.includes('*/*') || allowedTypes.some(type => {
            if (type.endsWith('/*')) {
                return file.mimetype.startsWith(type.replace('/*', '/'));
            }
            return file.mimetype === type;
        })) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} not allowed`), false);
        }
    }
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const bucketInfo = await minioService.getBucketInfo();
        res.json({
            status: 'healthy',
            service: 'minio-microservice',
            timestamp: new Date().toISOString(),
            bucket: bucketInfo
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            service: 'minio-microservice',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Upload single file
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No file provided' 
            });
        }

        const { originalname, buffer, mimetype, size } = req.file;
        const { customName, metadata } = req.body;
        
        // Generate unique object name
        const fileExtension = originalname.split('.').pop();
        const objectName = customName || `${uuidv4()}.${fileExtension}`;
        
        // Parse metadata if provided
        let parsedMetadata = {};
        if (metadata) {
            try {
                parsedMetadata = JSON.parse(metadata);
            } catch (e) {
                parsedMetadata = { metadata };
            }
        }

        const result = await minioService.uploadFile(buffer, objectName, mimetype, parsedMetadata);
        
        // Generate presigned URL for immediate access
        const downloadUrl = await minioService.getFileUrl(objectName);

        res.json({
            success: true,
            data: {
                ...result,
                originalName: originalname,
                downloadUrl,
                urlExpiry: process.env.DEFAULT_URL_EXPIRY || 3600
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload multiple files
app.post('/upload/multiple', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'No files provided' 
            });
        }

        const uploadPromises = req.files.map(async (file, index) => {
            const { originalname, buffer, mimetype } = file;
            const fileExtension = originalname.split('.').pop();
            const objectName = `${uuidv4()}.${fileExtension}`;
            
            const result = await minioService.uploadFile(buffer, objectName, mimetype, {
                originalName: originalname,
                uploadBatch: req.body.batchId || uuidv4(),
                fileIndex: index
            });
            
            const downloadUrl = await minioService.getFileUrl(objectName);
            
            return {
                ...result,
                originalName: originalname,
                downloadUrl
            };
        });

        const results = await Promise.all(uploadPromises);

        res.json({
            success: true,
            data: {
                files: results,
                totalFiles: results.length,
                batchId: req.body.batchId || uuidv4()
            }
        });
    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get file download URL
app.get('/file/:objectName/url', async (req, res) => {
    try {
        const { objectName } = req.params;
        const { expiry } = req.query;
        
        const url = await minioService.getFileUrl(objectName, expiry ? parseInt(expiry) : undefined);
        
        res.json({
            success: true,
            data: {
                objectName,
                downloadUrl: url,
                expiry: expiry || process.env.DEFAULT_URL_EXPIRY || 3600
            }
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Get file metadata
app.get('/file/:objectName/metadata', async (req, res) => {
    try {
        const { objectName } = req.params;
        const metadata = await minioService.getFileMetadata(objectName);
        
        res.json({
            success: true,
            data: metadata
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Download file directly
app.get('/file/:objectName/download', async (req, res) => {
    try {
        const { objectName } = req.params;
        
        // Get file metadata first
        const metadata = await minioService.getFileMetadata(objectName);
        
        // Get file buffer
        const fileBuffer = await minioService.downloadFile(objectName);
        
        // Set appropriate headers
        res.setHeader('Content-Type', metadata.contentType);
        res.setHeader('Content-Length', metadata.size);
        res.setHeader('Content-Disposition', `attachment; filename="${objectName}"`);
        
        res.send(fileBuffer);
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Delete file
app.delete('/file/:objectName', async (req, res) => {
    try {
        const { objectName } = req.params;
        
        await minioService.deleteFile(objectName);
        
        res.json({
            success: true,
            message: `File ${objectName} deleted successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// List files
app.get('/files', async (req, res) => {
    try {
        const { prefix = '', limit = 100 } = req.query;
        
        const files = await minioService.listFiles(prefix, parseInt(limit));
        
        res.json({
            success: true,
            data: {
                files,
                count: files.length,
                prefix: prefix || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Check if file exists
app.head('/file/:objectName', async (req, res) => {
    try {
        const { objectName } = req.params;
        const exists = await minioService.fileExists(objectName);
        
        if (exists) {
            const metadata = await minioService.getFileMetadata(objectName);
            res.setHeader('Content-Length', metadata.size);
            res.setHeader('Content-Type', metadata.contentType);
            res.status(200).end();
        } else {
            res.status(404).end();
        }
    } catch (error) {
        res.status(500).end();
    }
});

// Get bucket information
app.get('/bucket/info', async (req, res) => {
    try {
        const bucketInfo = await minioService.getBucketInfo();
        
        res.json({
            success: true,
            data: bucketInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large'
            });
        }
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
    
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(port, host, () => {
    console.log(`🚀 MinIO Microservice running on http://${host}:${port}`);
    console.log(`📁 Bucket: ${process.env.MINIO_BUCKET || 'openlog-files'}`);
    console.log(`🔗 MinIO Endpoint: ${process.env.MINIO_ENDPOINT || '127.0.0.1'}:${process.env.MINIO_PORT || 9000}`);
});

export default app;
