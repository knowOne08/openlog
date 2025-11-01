# OpenLog Enhanced Backend with MinIO

This enhanced setup separates concerns by having MinIO run in Docker while integrating enhanced file management APIs into the existing OpenLog backend.

## 📁 Project Structure

```
openlog/
├── minio-docker/          # MinIO Docker setup (standalone)
│   ├── docker-compose.yml
│   ├── start.sh
│   └── README.md
├── backend/               # Enhanced OpenLog backend
│   ├── routes/
│   │   ├── files.js      # NEW: Enhanced file management API
│   │   ├── upload.js     # Existing upload routes
│   │   └── ...
│   ├── utils/
│   │   └── minio.js      # Enhanced MinIO utilities
│   └── test-backend.js   # NEW: Backend testing script
└── ...
```

## 🚀 Quick Start

### 1. Start MinIO Service

```bash
# Navigate to MinIO docker setup
cd minio-docker

# Start MinIO in Docker
./start.sh
# OR
docker-compose up -d

# Verify MinIO is running
curl http://localhost:9000/minio/health/live
```

**MinIO Console:** http://localhost:9001 (minioadmin/minioadmin)

### 2. Start Enhanced Backend

```bash
# Navigate to backend
cd backend

# Install any missing dependencies
npm install

# Start the backend server
npm start
```

**Backend API:** http://localhost:5000/api/v1

### 3. Test the Enhanced APIs

```bash
# Test the new file management APIs
npm test
```

## 🔌 New API Endpoints

The backend now includes enhanced file management capabilities:

### File Management Routes (`/api/v1/files`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/files` | List files with pagination and filters |
| `GET` | `/files/stats` | Get file statistics |
| `GET` | `/files/:fileId/metadata` | Get detailed file metadata |
| `GET` | `/files/:fileId/download-url` | Get presigned download URL |
| `DELETE` | `/files/:fileId` | Delete file (with cleanup) |

### Enhanced Features

✅ **Pagination & Filtering**
```bash
# List files with pagination
GET /api/v1/files?page=1&limit=20&type=local_file&visibility=public

# Filter by owner
GET /api/v1/files?owner_id=user123&limit=10
```

✅ **Secure File Access**
```bash
# Get temporary download URL (expires in 1 hour)
GET /api/v1/files/file123/download-url?expiry=3600
```

✅ **Complete Cleanup**
```bash
# Delete file from MinIO, database, search index, and tags
DELETE /api/v1/files/file123
```

✅ **Statistics & Analytics**
```bash
# Get file statistics
GET /api/v1/files/stats
# Returns: total files, size, type breakdown, etc.
```

## 🛠️ Enhanced MinIO Utilities

The `utils/minio.js` file now includes additional functions:

```javascript
import { 
    uploadFile,        // Existing
    getFileUrl,        // Existing  
    deleteFile,        // Enhanced
    fileExists,        // NEW
    getFileMetadata,   // NEW
    listFiles         // NEW
} from './utils/minio.js';
```

## 🧪 Testing

### Backend API Testing
```bash
cd backend
npm test
```

### Manual API Testing
```bash
# Health check
curl http://localhost:5000/api/v1/

# List files
curl "http://localhost:5000/api/v1/files?limit=5"

# Get file metadata
curl "http://localhost:5000/api/v1/files/YOUR_FILE_ID/metadata"

# Get download URL
curl "http://localhost:5000/api/v1/files/YOUR_FILE_ID/download-url?expiry=1800"
```

## 🔧 Configuration

### MinIO Configuration

MinIO settings are configured in `minio-docker/docker-compose.yml`:

```yaml
environment:
  - MINIO_ROOT_USER=minioadmin     # Change for production
  - MINIO_ROOT_PASSWORD=minioadmin # Change for production
```

### Backend Configuration

Update your backend `.env` file:

```env
# MinIO Configuration
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=openlog-files
```

## 🚀 Production Deployment

### MinIO Production Setup

1. **Update credentials in docker-compose.yml:**
   ```yaml
   environment:
     - MINIO_ROOT_USER=your_secure_access_key
     - MINIO_ROOT_PASSWORD=your_secure_secret_key_min_8_chars
   ```

2. **Add SSL and reverse proxy:**
   - Use nginx or Cloudflare for SSL termination
   - Configure proper firewall rules

3. **Data persistence:**
   - MinIO data is stored in Docker volume `minio-data`
   - Set up regular backups

### Backend Production

1. **Environment variables:**
   ```env
   NODE_ENV=production
   MINIO_ENDPOINT=your-minio-domain.com
   MINIO_USE_SSL=true
   ```

2. **Process management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name openlog-backend
   ```

## 🔍 Monitoring

### MinIO Health
```bash
# Check MinIO health
curl http://localhost:9000/minio/health/live

# View MinIO logs
docker-compose logs -f minio
```

### Backend Health
```bash
# Check backend health
curl http://localhost:5000/api/v1/

# View backend logs
pm2 logs openlog-backend
```

## 🛠️ Troubleshooting

### Common Issues

1. **MinIO connection refused:**
   ```bash
   # Check if MinIO is running
   docker ps | grep minio
   
   # Restart MinIO
   cd minio-docker && docker-compose restart
   ```

2. **Backend can't connect to MinIO:**
   - Verify `MINIO_ENDPOINT` and `MINIO_PORT` in backend `.env`
   - Check Docker network connectivity
   - Verify MinIO credentials

3. **File upload fails:**
   - Check disk space: `docker system df`
   - Verify MinIO bucket exists
   - Check file size limits

### Useful Commands

```bash
# View all containers
docker ps -a

# MinIO container logs
docker logs openlog-minio

# Reset MinIO (DANGER: deletes all data)
cd minio-docker && docker-compose down -v && docker-compose up -d

# Backend logs (if using PM2)
pm2 logs openlog-backend --lines 50
```

## 📚 API Documentation

Visit `http://localhost:5000/api/v1/` for the full API documentation with all available endpoints.

## 🎯 Next Steps

1. **Test the enhanced APIs** with your frontend
2. **Update your frontend** to use the new file management endpoints
3. **Configure production deployment** with proper SSL and security
4. **Set up monitoring** and backup strategies
5. **Consider implementing authentication** for file access

This enhanced setup provides a robust, scalable file management system while keeping your existing OpenLog architecture intact!
