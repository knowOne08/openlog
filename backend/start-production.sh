#!/bin/bash

echo "🚀 Starting OpenLog Backend Services..."

# Function to check if a service is running
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        
        echo "🔄 Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Start Docker Compose services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
check_service "MinIO" "http://localhost:9000/minio/health/live"
check_service "MeiliSearch" "http://localhost:7700/health"

if [ $? -eq 0 ]; then
    echo "🎉 All services are ready! Starting backend..."
    npm start
else
    echo "❌ Services failed to start. Exiting..."
    exit 1
fi
