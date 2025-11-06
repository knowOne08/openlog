# OpenLog Services Setup

This directory contains the configuration for running OpenLog's external services (MinIO and MeiliSearch) in Docker containers.

## Services Included

### MinIO (Object Storage)
- **Port**: 9000 (API), 9001 (Console)
- **Purpose**: File storage and retrieval
- **Console**: http://localhost:9001
- **Default Credentials**: minioadmin / minioadmin

### MeiliSearch (Search Engine)
- **Port**: 7700
- **Purpose**: Fast, typo-tolerant search functionality
- **API**: http://localhost:7700
- **Master Key**: Set in docker-compose.yml (change in production!)

## Quick Start

### Development
```bash
# Start services only
npm run services:start

# Start services and backend together
npm run setup
```

### Production
```bash
# Start everything (services + backend) for production
npm run prod
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run services:start` | Start MinIO and MeiliSearch containers |
| `npm run services:stop` | Stop all containers |
| `npm run services:restart` | Restart all containers |
| `npm run services:logs` | View container logs |
| `npm run prod` | Start services and backend in production mode |

## Manual Docker Commands

If you prefer to use Docker directly:

```bash
# Start services
cd minio && docker-compose up -d

# Stop services  
cd minio && docker-compose down

# View logs
cd minio && docker-compose logs -f

# Check status
docker ps
```

## Environment Configuration

Make sure your `.env` file includes:

```bash
# MinIO Configuration
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=openlog-uploads
MINIO_USE_SSL=false

# MeiliSearch Configuration  
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=your-secure-master-key-change-this
```

## Production Considerations

### Security
1. **Change default credentials** in `docker-compose.yml`
2. **Set strong master key** for MeiliSearch
3. **Configure SSL/TLS** for production deployments
4. **Use environment-specific secrets**

### Performance
1. **Volume mounting**: Data persists in Docker volumes
2. **Health checks**: Built-in health monitoring
3. **Restart policies**: Services restart automatically on failure

### Monitoring
- Check service health: `docker ps`
- View logs: `npm run services:logs`
- MinIO metrics: Available through MinIO Console
- MeiliSearch stats: `curl http://localhost:7700/stats`

## Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker info

# Check port availability
lsof -i :9000 -i :9001 -i :7700

# Reset everything
npm run services:stop
docker system prune -f
npm run services:start
```

### Connection issues
1. Verify services are running: `docker ps`
2. Check health endpoints:
   - MinIO: `curl http://localhost:9000/minio/health/live`
   - MeiliSearch: `curl http://localhost:7700/health`
3. Review logs: `npm run services:logs`

### Data persistence
- MinIO data: Stored in `minio-data` Docker volume
- MeiliSearch data: Stored in `meilisearch-data` Docker volume
- To reset: `docker volume rm openlog_minio-data openlog_meilisearch-data`

## Docker Compose Configuration

The `docker-compose.yml` includes:
- **Networking**: Services communicate via `openlog-network`
- **Volumes**: Persistent data storage
- **Health checks**: Automatic service monitoring
- **Restart policies**: Ensures services stay running
- **Environment variables**: Configurable service settings

## Development vs Production

### Development
- Uses default credentials for ease of setup
- Services exposed on localhost ports
- Debug-friendly logging

### Production  
- **Must change** default credentials
- Consider using Docker secrets
- Set up proper SSL termination
- Configure backup strategies
- Monitor resource usage

## Next Steps

1. Start the services: `npm run services:start`
2. Configure your `.env` file with the service URLs
3. Start your backend: `npm start`
4. Access MinIO Console at http://localhost:9001
5. Test MeiliSearch at http://localhost:7700
