#!/bin/bash

# MinIO Service Startup Script

echo "🚀 Starting MinIO Microservice..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found, copying from .env.example"
    cp .env.example .env
    echo "📝 Please update .env with your MinIO credentials"
fi

# Check if MinIO is running (optional check)
echo "🔍 Checking if MinIO server is accessible..."
MINIO_ENDPOINT=$(grep MINIO_ENDPOINT .env | cut -d '=' -f2)
MINIO_PORT=$(grep MINIO_PORT .env | cut -d '=' -f2)

if command -v curl >/dev/null 2>&1; then
    if curl -s "http://${MINIO_ENDPOINT}:${MINIO_PORT}/minio/health/live" >/dev/null; then
        echo "✅ MinIO server is accessible"
    else
        echo "⚠️  MinIO server might not be running at ${MINIO_ENDPOINT}:${MINIO_PORT}"
        echo "   Please ensure MinIO is running before starting the service"
    fi
fi

# Start the service
echo "🎯 Starting service..."
node server.js
