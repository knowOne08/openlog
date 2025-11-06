#!/bin/bash

# Health check script for production deployment
echo "🔍 Running health checks..."

# Check if backend is responding
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
    exit 1
fi

# Check if MinIO is responding
if curl -s http://localhost:9000/minio/health/live > /dev/null; then
    echo "✅ MinIO is healthy"
else
    echo "❌ MinIO is not responding"
    exit 1
fi

# Check if MeiliSearch is responding  
if curl -s http://localhost:7700/health > /dev/null; then
    echo "✅ MeiliSearch is healthy"
else
    echo "❌ MeiliSearch is not responding"
    exit 1
fi

echo "🎉 All services are healthy!"
