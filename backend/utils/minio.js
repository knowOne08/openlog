import { Client } from 'minio';

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET || 'openlog-files';

async function ensureBucket() {
    if (!(await minioClient.bucketExists(BUCKET).catch(() => false))) {
        await minioClient.makeBucket(BUCKET, 'us-east-1');
    }
}

async function uploadFile(fileBuffer, objectName, mimetype = 'application/octet-stream') {
    await ensureBucket();
    await minioClient.putObject(BUCKET, objectName, fileBuffer, fileBuffer.length, { 'Content-Type': mimetype });
    return objectName;
}

async function getFileUrl(objectName, expiry = 3600) {
    return minioClient.presignedGetObject(BUCKET, objectName, expiry);
}

/**
 * Delete a file from MinIO
 * @param {string} objectName - Name of the file to delete
 * @returns {Promise<void>}
 */
async function deleteFile(objectName) {
    try {
        await minioClient.removeObject(BUCKET, objectName);
        console.log(`File ${objectName} deleted successfully from MinIO`);
    } catch (error) {
        console.error('MinIO delete error:', error);
        throw new Error(`MinIO Error: Failed to delete file ${objectName}`);
    }
}

/**
 * Check if a file exists in MinIO
 * @param {string} objectName - Name of the file to check
 * @returns {Promise<boolean>}
 */
async function fileExists(objectName) {
    try {
        await minioClient.statObject(BUCKET, objectName);
        return true;
    } catch (error) {
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    }
}

/**
 * Get file metadata from MinIO
 * @param {string} objectName - Name of the file
 * @returns {Promise<Object>}
 */
async function getFileMetadata(objectName) {
    try {
        const stat = await minioClient.statObject(BUCKET, objectName);
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
        throw new Error(`Failed to get file metadata: ${error.message}`);
    }
}

/**
 * List files in MinIO bucket
 * @param {string} prefix - Optional prefix to filter files
 * @param {number} limit - Maximum number of files to return
 * @returns {Promise<Array>}
 */
async function listFiles(prefix = '', limit = 1000) {
    try {
        const files = [];
        const stream = minioClient.listObjects(BUCKET, prefix, true);
        
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
        throw new Error(`Failed to list files: ${error.message}`);
    }
}

export { uploadFile, getFileUrl, deleteFile, fileExists, getFileMetadata, listFiles };
