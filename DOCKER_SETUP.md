# OpenLog - Unified Docker Setup

This unified Docker Compose setup includes:
- **MinIO** (Object Storage) - Port 9000 (API) & 9001 (Console)
- **MeiliSearch** (Search Engine) - Port 7700
- **Backend** (Node.js API) - Port 8000
- **Frontend** (Next.js) - Port 3000

## Quick Start

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start All Services
```bash
docker-compose up -d
```

### 3. Check Service Health
```bash
docker-compose ps
```

## For Coolify Users

### Coolify Configuration:
1. **Repository**: Point to your GitHub repo
2. **Build Pack**: Docker Compose
3. **Docker Compose File**: `docker-compose.yml` (root)
4. **Environment Variables**: Set in Coolify dashboard

### Required Environment Variables in Coolify:
```
MINIO_ROOT_USER=your-minio-user
MINIO_ROOT_PASSWORD=your-secure-password
MEILI_MASTER_KEY=your-meili-master-key
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Port Mapping in Coolify:
- Backend: 8000
- Frontend: 3000
- MinIO API: 9000
- MinIO Console: 9001
- MeiliSearch: 7700

## Service URLs (Local Development)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **MinIO Console**: http://localhost:9001
- **MinIO API**: http://localhost:9000
- **MeiliSearch**: http://localhost:7700

## Production Notes

### Health Checks
All services include health checks for proper startup orchestration.

### Data Persistence
- MinIO data: `minio_data` volume
- MeiliSearch data: `meilisearch_data` volume

### Service Dependencies
- Backend waits for MinIO and MeiliSearch to be healthy
- Frontend waits for Backend to be ready

## Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f [service-name]
```

### Rebuild and restart
```bash
docker-compose up -d --build
```

### Remove everything (including volumes)
```bash
docker-compose down -v
```

## For Traditional Server Deployment

If you're not using Coolify, you can still use the GitHub Actions workflow. The unified Docker Compose will work with your current deployment script.

Just update your deploy script to run:
```bash
docker-compose up -d
```

Instead of the individual service startup commands.
