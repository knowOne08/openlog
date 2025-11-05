#!/bin/bash

echo "🚀 Testing OpenLog Backend Services Setup"
echo "======================================="

# Change to backend directory
cd backend

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please review and update it if needed."
    else
        echo "❌ No .env.example found. Please create a .env file."
        exit 1
    fi
fi

echo "📋 Current environment variables:"
echo "MINIO_ROOT_USER: $(grep MINIO_ROOT_USER .env | cut -d'=' -f2)"
echo "MEILI_MASTER_KEY: $(grep MEILI_MASTER_KEY .env | cut -d'=' -f2 | head -c 10)..."

echo ""
echo "🐳 Starting all services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "🔍 Checking service health..."

# Function to check if a service is responding
check_service() {
    local name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo -n "Checking $name... "
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ Ready"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ Not responding"
    return 1
}

# Check all services
check_service "MinIO" "http://localhost:9000/minio/health/live"
check_service "MeiliSearch" "http://localhost:7700/health"
check_service "Backend" "http://localhost:8000/health"
check_service "Frontend" "http://localhost:3000"

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Access URLs:"
echo "├── Frontend:      http://localhost:3000"
echo "├── Backend API:   http://localhost:8000"
echo "├── MinIO Console: http://localhost:9001"
echo "├── MinIO API:     http://localhost:9000"
echo "└── MeiliSearch:   http://localhost:7700"

echo ""
echo "🔑 Default Credentials:"
echo "├── MinIO: minioadmin / minioadmin"
echo "└── MeiliSearch: API Key from .env file"

echo ""
echo "📝 Useful Commands:"
echo "├── View logs:     docker-compose logs -f [service-name]"
echo "├── Stop services: docker-compose down"
echo "├── Restart:       docker-compose restart [service-name]"
echo "└── Rebuild:       docker-compose up -d --build"

echo ""
echo "✅ Setup complete! Check the URLs above to test your application."
