//! test to upload data to minio

// const Minio = require('minio');
// const fs = require('fs');
// const path = require('path');

// // Configure MinIO client
// const minioClient = new Minio.Client({
//     endPoint: process.env.MINIO_ENDPOINT,           // your MinIO server address
//     port: 9000,                      // your MinIO port
//     useSSL: false,                   // set true if you enabled https
//     accessKey: process.env.MINIO_ACCESS_KEY,      // your MinIO access key
//     secretKey: process.env.MINIO_SECRET_KEY, // your MinIO secret key
// });

// // Bucket name
// const bucketName = 'openlog-test-bucket';

// // File to upload (replace with your own file path)
// const filePath = path.join(__dirname, 'test.mp4');
// const objectName = 'video.mp4';

// async function uploadAndGetUrl() {
//     try {
//         // Check if bucket exists
//         const exists = await minioClient.bucketExists(bucketName);
//         if (!exists) {
//             console.log(`Bucket "${bucketName}" does not exist. Creating...`);
//             await minioClient.makeBucket(bucketName, 'us-east-1');
//             console.log(`Bucket "${bucketName}" created.`);
//         }

//         // Upload file to bucket
//         await minioClient.fPutObject(bucketName, objectName, filePath, {
//             'Content-Type': 'video/mp4',
//         });
//         console.log(`File "${objectName}" uploaded successfully.`);

//         // Generate presigned URL valid for 1 hour (3600 seconds)
//         const url = await minioClient.presignedGetObject(bucketName, objectName, 3600);
//         console.log(`Presigned URL: ${url}`);
//     } catch (err) {
//         console.error('Error:', err);
//     }
// }

// uploadAndGetUrl();


//! test to get data from minio

const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,           // your MinIO server address
    port: 9000,                      // your MinIO port
    useSSL: false,                   // set true if you enabled https
    accessKey: process.env.MINIO_ACCESS_KEY,      // your MinIO access key
    secretKey: process.env.MINIO_SECRET_KEY, // your MinIO secret key
});

const bucketName = 'openlog-test-bucket';
const objectName = 'video.mp4'; // Name of the uploaded file

async function getPresignedUrl() {
    try {
        const url = await minioClient.presignedGetObject(bucketName, objectName, 3600); // 1 hour expiry
        console.log('Presigned URL:', url);
        return url;
    } catch (err) {
        console.error('Error getting presigned URL:', err);
    }
}

getPresignedUrl();
