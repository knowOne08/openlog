# OpenLog Backend Setup Guide

Enhanced backend with improved MinIO integration and file management APIs.

## 🚀 Quick Start

### Option 1: Complete Setup (Recommended)
```bash
# This will start MinIO and then the backend
npm run setup
```

### Option 2: Step by Step
```bash
# 1. Start MinIO
npm run minio:start

# 2. Start backend (in a new terminal)
npm start
```

## 📁 Project Structure

```
backend/
├── minio/                 # MinIO Docker setup
│   ├── docker-compose.yml
│   ├── start.sh
│   └── README.md
├── routes/
│   ├── files.js          # 🆕 File management APIs
│   ├── upload.js         # Enhanced upload routes
│   └── ...
├── utils/
│   └── minio.js          # 🆕 Enhanced MinIO utilities
└── ...
```

## 🔌 New API Endpoints

Your backend now includes these enhanced file management endpoints:

### File Management
- `GET /api/v1/files` - List files with pagination and filtering
- `GET /api/v1/files/stats` - Get file statistics  
- `GET /api/v1/files/:id/metadata` - Get detailed file metadata
- `GET /api/v1/files/:id/download-url` - Generate secure download URLs
- `DELETE /api/v1/files/:id` - Complete file deletion (file + metadata + embeddings)

### Upload (Enhanced)
- `POST /api/v1/upload/file` - Upload files with metadata
- `POST /api/v1/upload/link` - Save links with metadata

## 📝 Usage Examples

### List Files
```bash
curl "http://localhost:5000/api/v1/files?page=1&limit=10&type=local_file"
```

### Get Download URL
```bash
curl "http://localhost:5000/api/v1/files/YOUR_FILE_ID/download-url?expiry=3600"
```

### File Statistics
```bash
curl "http://localhost:5000/api/v1/files/stats"
```

## 🛠️ Commands

```bash
# MinIO Management
npm run minio:start      # Start MinIO container
npm run minio:stop       # Stop MinIO container  
npm run minio:logs       # View MinIO logs

# Backend
npm start                # Start backend server
npm test                 # Test backend APIs
npm run dev              # Development mode
npm run prod             # Production mode

# Complete Setup
npm run setup            # Start MinIO + Backend together
```

## 🔧 Configuration

### MinIO Settings
- **Console**: http://localhost:9001 (minioadmin/minioadmin)
- **API**: http://localhost:9000
- **Data**: Stored in Docker volume

### Backend Settings
Update your `.env` file with MinIO credentials:
```env
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=openlog-files
```

## ✅ Features Added

- ✅ Enhanced file management APIs
- ✅ Secure presigned download URLs  
- ✅ Complete file deletion with cleanup
- ✅ File statistics and metadata
- ✅ Pagination and filtering
- ✅ Improved error handling
- ✅ Docker-based MinIO setup
- ✅ Convenient npm scripts

## 🧪 Testing

```bash
# Test the enhanced backend
npm test

# Manual API testing
curl http://localhost:5000/api/v1/files
```

The setup is now much cleaner and everything is contained within your backend folder!
