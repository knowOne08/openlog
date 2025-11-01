# MinIO Microservice

A standalone microservice for handling file uploads and downloads using MinIO object storage. This service can run independently and provides a REST API for file operations.

## Features

- ✅ File upload (single and multiple)
- ✅ File download (presigned URLs and direct download)
- ✅ File metadata retrieval
- ✅ File existence checking
- ✅ File deletion
- ✅ File listing with pagination
- ✅ Bucket management
- ✅ Health monitoring
- ✅ Error handling and validation
- ✅ CORS support
- ✅ Configurable file size and type restrictions

## Installation

1. Clone or copy the `minio-service` directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   MINIO_ENDPOINT=127.0.0.1
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=your_access_key
   MINIO_SECRET_KEY=your_secret_key
   MINIO_BUCKET=openlog-files
   ```

## MinIO Server Setup

### Option 1: Docker (Recommended)
```bash
# Start MinIO with Docker
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

### Option 2: Local Installation
1. Download MinIO from https://min.io/download
2. Start the server:
   ```bash
   # macOS/Linux
   ./minio server /path/to/data --console-address :9001
   
   # Windows
   minio.exe server C:\path\to\data --console-address :9001
   ```

### Option 3: Docker Compose (Full Stack)
```bash
# Start both MinIO and the microservice
docker-compose up -d
```

### MinIO Console Access
- Console URL: http://localhost:9001
- Default credentials: minioadmin / minioadmin

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
# Test module loading (no MinIO required)
npm test

# Test with running MinIO instance
npm run test:integration
```

## API Endpoints

### Health Check
- **GET** `/health` - Service health status

### File Upload
- **POST** `/upload` - Upload single file
  - Form data: `file` (required), `customName` (optional), `metadata` (optional JSON)
- **POST** `/upload/multiple` - Upload multiple files
  - Form data: `files[]` (required), `batchId` (optional)

### File Access
- **GET** `/file/:objectName/url` - Get presigned download URL
  - Query: `expiry` (optional, seconds)
- **GET** `/file/:objectName/download` - Direct file download
- **GET** `/file/:objectName/metadata` - Get file metadata
- **HEAD** `/file/:objectName` - Check if file exists

### File Management
- **DELETE** `/file/:objectName` - Delete file
- **GET** `/files` - List files
  - Query: `prefix` (optional), `limit` (optional, default 100)

### Bucket Info
- **GET** `/bucket/info` - Get bucket information

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MINIO_ENDPOINT` | MinIO server endpoint | 127.0.0.1 |
| `MINIO_PORT` | MinIO server port | 9000 |
| `MINIO_ACCESS_KEY` | MinIO access key | Required |
| `MINIO_SECRET_KEY` | MinIO secret key | Required |
| `MINIO_BUCKET` | Default bucket name | openlog-files |
| `MINIO_USE_SSL` | Use SSL connection | false |
| `SERVICE_PORT` | Service port | 3001 |
| `SERVICE_HOST` | Service host | 0.0.0.0 |
| `MAX_FILE_SIZE` | Maximum file size | 100MB |
| `ALLOWED_FILE_TYPES` | Allowed MIME types | * |
| `DEFAULT_URL_EXPIRY` | Default URL expiry | 3600 |

## Examples

### Upload a file
```bash
curl -X POST http://localhost:3001/upload \
  -F "file=@example.pdf" \
  -F "customName=my-document.pdf" \
  -F "metadata={\"category\":\"documents\",\"version\":\"1.0\"}"
```

### Get download URL
```bash
curl http://localhost:3001/file/my-document.pdf/url?expiry=7200
```

### Download file directly
```bash
curl http://localhost:3001/file/my-document.pdf/download -o downloaded-file.pdf
```

### List files
```bash
curl http://localhost:3001/files?limit=10&prefix=documents/
```

### Delete file
```bash
curl -X DELETE http://localhost:3001/file/my-document.pdf
```

## Production Deployment

For production deployment on Oracle Cloud or any server:

1. Update `.env` with production MinIO credentials
2. Set `MINIO_USE_SSL=true` if using HTTPS
3. Configure proper CORS origins in `ALLOWED_ORIGINS`
4. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name minio-service
   ```

## Error Handling

The service returns structured error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - File not found
- `500` - Internal server error
- `503` - Service unavailable

## Security Considerations

- Always use strong access keys for MinIO
- Enable SSL in production
- Configure appropriate CORS origins
- Set reasonable file size limits
- Validate file types based on your requirements
- Use presigned URLs for secure file access
- Consider implementing authentication middleware

## License

ISC
