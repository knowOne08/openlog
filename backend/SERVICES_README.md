# OpenLog Backend - Services Setup

This backend includes Docker Compose configuration for required services:
- **MinIO** (Object Storage) 
- **MeiliSearch** (Search Engine)

## 🚀 Quick Start

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start Services
```bash
docker-compose up -d
```

### 3. Start Backend
```bash
npm install
npm start
```

## 📋 Service Details

### MinIO (Object Storage)
- **API**: http://localhost:9000
- **Console**: http://localhost:9001
- **Credentials**: minioadmin / minioadmin123

### MeiliSearch (Search Engine)
- **API**: http://localhost:7700
- **Health**: http://localhost:7700/health

## 🔧 Commands

### Start services only
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View service logs
```bash
docker-compose logs -f
```

### Remove all data (reset)
```bash
docker-compose down -v
```

## 🏗️ For Coolify Deployment

In Coolify:
1. Create a new service
2. Point to your backend repository
3. Set build pack to "Docker Compose"
4. Configure environment variables in Coolify dashboard
5. Deploy!

Coolify will automatically start the services defined in `docker-compose.yml` before starting your backend application.
