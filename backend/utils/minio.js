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

export { uploadFile, getFileUrl };