import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

class MinioService {
    constructor() {
        this.client = new Client({
            endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
            port: parseInt(process.env.MINIO_PORT) || 9000,
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY,
        });

        this.bucket = process.env.MINIO_BUCKET || 'openlog-files';
        this.defaultExpiry = parseInt(process.env.DEFAULT_URL_EXPIRY) || 3600;
        
        this.initializeBucket();
    }

    async initializeBucket() {
        try {
            const exists = await this.client.bucketExists(this.bucket);
            if (!exists) {
                await this.client.makeBucket(this.bucket, 'us-east-1');
                console.log(`✅ Bucket "${this.bucket}" created successfully`);
            } else {
                console.log(`✅ Bucket "${this.bucket}" already exists`);
            }
        } catch (error) {
            console.error(`❌ Error initializing bucket: ${error.message}`);
            throw error;
        }
    }

    /**
     * Upload a file to MinIO
     * @param {Buffer} fileBuffer - File buffer
     * @param {string} objectName - Name for the object in MinIO
     * @param {string} contentType - MIME type of the file
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} Upload result
     */
    async uploadFile(fileBuffer, objectName, contentType = 'application/octet-stream', metadata = {}) {
        try {
            const uploadMetadata = {
                'Content-Type': contentType,
                'Upload-Date': new Date().toISOString(),
                ...metadata
            };

            await this.client.putObject(
                this.bucket, 
                objectName, 
                fileBuffer, 
                fileBuffer.length, 
                uploadMetadata
            );

            return {
                success: true,
                objectName,
                bucket: this.bucket,
                size: fileBuffer.length,
                contentType,
                uploadDate: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Upload error: ${error.message}`);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    /**
     * Get a presigned URL for file download
     * @param {string} objectName - Name of the object
     * @param {number} expiry - URL expiry time in seconds
     * @returns {Promise<string>} Presigned URL
     */
    async getFileUrl(objectName, expiry = null) {
        try {
            const expiryTime = expiry || this.defaultExpiry;
            const url = await this.client.presignedGetObject(this.bucket, objectName, expiryTime);
            return url;
        } catch (error) {
            console.error(`❌ Get URL error: ${error.message}`);
            throw new Error(`Failed to generate URL: ${error.message}`);
        }
    }

    /**
     * Get file metadata
     * @param {string} objectName - Name of the object
     * @returns {Promise<Object>} File metadata
     */
    async getFileMetadata(objectName) {
        try {
            const stat = await this.client.statObject(this.bucket, objectName);
            return {
                name: objectName,
                size: stat.size,
                contentType: stat.metaData['content-type'],
                lastModified: stat.lastModified,
                etag: stat.etag,
                metadata: stat.metaData
            };
        } catch (error) {
            if (error.code === 'NotFound') {
                throw new Error(`File not found: ${objectName}`);
            }
            console.error(`❌ Get metadata error: ${error.message}`);
            throw new Error(`Failed to get file metadata: ${error.message}`);
        }
    }

    /**
     * Download file as buffer
     * @param {string} objectName - Name of the object
     * @returns {Promise<Buffer>} File buffer
     */
    async downloadFile(objectName) {
        try {
            const stream = await this.client.getObject(this.bucket, objectName);
            const chunks = [];
            
            return new Promise((resolve, reject) => {
                stream.on('data', chunk => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        } catch (error) {
            if (error.code === 'NotFound') {
                throw new Error(`File not found: ${objectName}`);
            }
            console.error(`❌ Download error: ${error.message}`);
            throw new Error(`Failed to download file: ${error.message}`);
        }
    }

    /**
     * Delete a file from MinIO
     * @param {string} objectName - Name of the object to delete
     * @returns {Promise<boolean>} Success status
     */
    async deleteFile(objectName) {
        try {
            await this.client.removeObject(this.bucket, objectName);
            return true;
        } catch (error) {
            console.error(`❌ Delete error: ${error.message}`);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * List files in the bucket
     * @param {string} prefix - Optional prefix to filter files
     * @param {number} limit - Maximum number of files to return
     * @returns {Promise<Array>} List of files
     */
    async listFiles(prefix = '', limit = 1000) {
        try {
            const files = [];
            const stream = this.client.listObjects(this.bucket, prefix, true);
            
            return new Promise((resolve, reject) => {
                stream.on('data', obj => {
                    if (files.length < limit) {
                        files.push({
                            name: obj.name,
                            size: obj.size,
                            lastModified: obj.lastModified,
                            etag: obj.etag
                        });
                    }
                });
                stream.on('end', () => resolve(files));
                stream.on('error', reject);
            });
        } catch (error) {
            console.error(`❌ List files error: ${error.message}`);
            throw new Error(`Failed to list files: ${error.message}`);
        }
    }

    /**
     * Check if file exists
     * @param {string} objectName - Name of the object
     * @returns {Promise<boolean>} Whether file exists
     */
    async fileExists(objectName) {
        try {
            await this.client.statObject(this.bucket, objectName);
            return true;
        } catch (error) {
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    /**
     * Get bucket info
     * @returns {Promise<Object>} Bucket information
     */
    async getBucketInfo() {
        try {
            const exists = await this.client.bucketExists(this.bucket);
            if (!exists) {
                throw new Error(`Bucket ${this.bucket} does not exist`);
            }

            const files = await this.listFiles();
            const totalSize = files.reduce((sum, file) => sum + file.size, 0);

            return {
                name: this.bucket,
                exists: true,
                fileCount: files.length,
                totalSize,
                endpoint: process.env.MINIO_ENDPOINT
            };
        } catch (error) {
            console.error(`❌ Get bucket info error: ${error.message}`);
            throw new Error(`Failed to get bucket info: ${error.message}`);
        }
    }
}

export default MinioService;
