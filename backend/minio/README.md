# MinIO Setup for OpenLog Backend

Simple Docker setup for running MinIO object storage for OpenLog backend.

## Quick Start

1. **Start MinIO:**
   ```bash
   # From backend folder
   npm run minio:start
   
   # Or directly
   cd minio && ./start.sh
   ```

2. **Access MinIO Console:**
   - URL: http://localhost:9001
   - Username: `minioadmin`
   - Password: `minioadmin`

3. **MinIO API Endpoint:**
   - URL: http://localhost:9000

## Configuration

### Default Credentials
- Access Key: `minioadmin`
- Secret Key: `minioadmin`

### Ports
- **9000**: MinIO API
- **9001**: MinIO Console (Web UI)

## Commands

```bash
# Start MinIO
docker-compose up -d

# View logs
docker-compose logs -f

# Stop MinIO
docker-compose down

# Stop and remove data
docker-compose down -v
```

## Production Setup

For production, update the credentials in `docker-compose.yml`:

```yaml
environment:
  - MINIO_ROOT_USER=your_secure_access_key
  - MINIO_ROOT_PASSWORD=your_secure_secret_key_min_8_chars
```

## Data Persistence

MinIO data is stored in a Docker volume named `minio-data`. To backup:

```bash
# Backup
docker run --rm -v minio-docker_minio-data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz -C /data .

# Restore
docker run --rm -v minio-docker_minio-data:/data -v $(pwd):/backup alpine tar xzf /backup/minio-backup.tar.gz -C /data
```

## Troubleshooting

### Check if MinIO is running
```bash
curl http://localhost:9000/minio/health/live
```

### Reset MinIO
```bash
docker-compose down -v
docker-compose up -d
```
