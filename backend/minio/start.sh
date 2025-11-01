#!/bin/bash

echo "🚀 Starting MinIO for OpenLog..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Change to the minio directory if not already there
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Start MinIO
echo "🐳 Starting MinIO container..."
docker-compose up -d

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to be ready..."
sleep 5

# Check if MinIO is accessible
if curl -s http://localhost:9000/minio/health/live > /dev/null; then
    echo "✅ MinIO is running successfully!"
    echo ""
    echo "📊 MinIO Console: http://localhost:9001"
    echo "🔑 Credentials: minioadmin / minioadmin"
    echo "🌐 API Endpoint: http://localhost:9000"
    echo ""
    echo "🎯 You can now start your OpenLog backend server:"
    echo "   cd .. && npm start"
else
    echo "⚠️  MinIO might still be starting up..."
    echo "   Check status with: docker-compose logs"
    echo "   Or try: docker ps"
fi
