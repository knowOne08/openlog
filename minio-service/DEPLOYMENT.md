# MinIO Microservice Deployment Guide

This guide covers deploying the MinIO microservice in different environments.

## Local Development

### Prerequisites
- Node.js 18+ 
- MinIO server

### Setup Steps
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MinIO server:
   ```bash
   # Using Docker
   docker run -p 9000:9000 -p 9001:9001 \
     -e "MINIO_ROOT_USER=minioadmin" \
     -e "MINIO_ROOT_PASSWORD=minioadmin" \
     minio/minio server /data --console-address ":9001"
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your MinIO credentials
   ```

4. Start the service:
   ```bash
   npm start
   ```

5. Test the service:
   ```bash
   curl http://localhost:3001/health
   ```

## Production Deployment

### Oracle Cloud Infrastructure (OCI)

#### Option 1: Direct Deployment on VM

1. **Provision a VM Instance**
   - Choose Ubuntu 20.04/22.04 LTS
   - Open ports 3001 (service) and 9000-9001 (MinIO)

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Docker (for MinIO)
   sudo apt-get install -y docker.io
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   ```

3. **Deploy MinIO**
   ```bash
   # Create persistent data directory
   sudo mkdir -p /data/minio
   sudo chown $USER:$USER /data/minio
   
   # Start MinIO container
   docker run -d \
     --name minio \
     -p 9000:9000 -p 9001:9001 \
     -v /data/minio:/data \
     -e "MINIO_ROOT_USER=your_secure_access_key" \
     -e "MINIO_ROOT_PASSWORD=your_secure_secret_key" \
     --restart unless-stopped \
     minio/minio server /data --console-address ":9001"
   ```

4. **Deploy the Microservice**
   ```bash
   # Clone the service
   git clone <your-repo> minio-service
   cd minio-service
   
   # Install dependencies
   npm ci --production
   
   # Configure environment
   cp .env.example .env
   nano .env  # Edit with production values
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Start the service
   pm2 start server.js --name minio-service
   pm2 startup
   pm2 save
   ```

5. **Production Environment File**
   ```env
   # Production .env
   MINIO_ENDPOINT=127.0.0.1
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=your_secure_access_key
   MINIO_SECRET_KEY=your_secure_secret_key
   MINIO_BUCKET=production-files
   MINIO_USE_SSL=false
   
   SERVICE_PORT=3001
   SERVICE_HOST=0.0.0.0
   
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   
   MAX_FILE_SIZE=500MB
   ALLOWED_FILE_TYPES=image/*,video/*,audio/*,application/pdf,text/*
   
   DEFAULT_URL_EXPIRY=3600
   ```

#### Option 2: Docker Deployment

1. **Build and Deploy with Docker Compose**
   ```bash
   # Clone the repository
   git clone <your-repo> minio-service
   cd minio-service
   
   # Create production docker-compose file
   cp docker-compose.yml docker-compose.prod.yml
   ```

2. **Production Docker Compose**
   ```yaml
   version: '3.8'
   
   services:
     minio-service:
       build: .
       ports:
         - "3001:3001"
       environment:
         - MINIO_ENDPOINT=minio
         - MINIO_PORT=9000
         - MINIO_ACCESS_KEY=your_secure_access_key
         - MINIO_SECRET_KEY=your_secure_secret_key
         - MINIO_BUCKET=production-files
         - MINIO_USE_SSL=false
         - SERVICE_PORT=3001
         - SERVICE_HOST=0.0.0.0
         - ALLOWED_ORIGINS=https://yourdomain.com
         - MAX_FILE_SIZE=500MB
       depends_on:
         - minio
       restart: unless-stopped
       networks:
         - minio-network
   
     minio:
       image: minio/minio:latest
       ports:
         - "9000:9000"
         - "9001:9001"
       environment:
         - MINIO_ROOT_USER=your_secure_access_key
         - MINIO_ROOT_PASSWORD=your_secure_secret_key
       command: server /data --console-address ":9001"
       volumes:
         - minio-data:/data
       restart: unless-stopped
       networks:
         - minio-network
   
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./ssl:/etc/nginx/ssl
       depends_on:
         - minio-service
       restart: unless-stopped
       networks:
         - minio-network
   
   networks:
     minio-network:
       driver: bridge
   
   volumes:
     minio-data:
   ```

3. **Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Security Configuration

#### SSL/HTTPS Setup

1. **Nginx Configuration** (`nginx.conf`)
   ```nginx
   events {
       worker_connections 1024;
   }
   
   http {
       upstream minio-service {
           server minio-service:3001;
       }
       
       upstream minio-console {
           server minio:9001;
       }
       
       server {
           listen 80;
           server_name yourdomain.com;
           return 301 https://$server_name$request_uri;
       }
       
       server {
           listen 443 ssl;
           server_name yourdomain.com;
           
           ssl_certificate /etc/nginx/ssl/cert.pem;
           ssl_certificate_key /etc/nginx/ssl/key.pem;
           
           # MinIO Service API
           location /api/ {
               proxy_pass http://minio-service/;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
               client_max_body_size 500M;
           }
           
           # MinIO Console
           location /console/ {
               proxy_pass http://minio-console/;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }
       }
   }
   ```

#### Firewall Configuration

```bash
# Oracle Cloud - Security List Rules
# Allow HTTP (80) and HTTPS (443) from 0.0.0.0/0
# Allow MinIO API (9000) from your application servers only
# Allow SSH (22) from your IP only

# VM Firewall (ufw)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp  # For direct API access (optional)
sudo ufw enable
```

### Monitoring and Logging

#### Health Monitoring Script

```bash
#!/bin/bash
# health-check.sh

SERVICE_URL="http://localhost:3001"
HEALTH_ENDPOINT="$SERVICE_URL/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_ENDPOINT)

if [ $response -eq 200 ]; then
    echo "$(date): Service is healthy"
else
    echo "$(date): Service is unhealthy (HTTP $response)"
    # Restart service if needed
    pm2 restart minio-service
fi
```

#### Cron Job for Health Checks

```bash
# Add to crontab (crontab -e)
*/5 * * * * /path/to/health-check.sh >> /var/log/minio-service-health.log 2>&1
```

#### Log Management

```bash
# PM2 logs
pm2 logs minio-service

# Docker logs
docker-compose logs -f minio-service

# System logs
sudo journalctl -u docker -f
```

### Backup Strategy

#### MinIO Data Backup

```bash
#!/bin/bash
# backup-minio.sh

BACKUP_DIR="/backup/minio"
DATE=$(date +%Y%m%d_%H%M%S)
MINIO_DATA="/data/minio"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MinIO data
tar -czf "$BACKUP_DIR/minio_backup_$DATE.tar.gz" -C $MINIO_DATA .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "minio_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: minio_backup_$DATE.tar.gz"
```

#### Automated Backups

```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * /path/to/backup-minio.sh >> /var/log/minio-backup.log 2>&1
```

### Performance Optimization

#### Resource Limits

```yaml
# Docker Compose resource limits
services:
  minio-service:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

#### Environment Tuning

```env
# Production optimizations
NODE_ENV=production
UV_THREADPOOL_SIZE=32
MAX_FILE_SIZE=1GB
DEFAULT_URL_EXPIRY=7200
```

### Troubleshooting

#### Common Issues

1. **Connection Refused**
   - Check if MinIO is running: `docker ps`
   - Verify network connectivity: `curl http://localhost:9000/minio/health/live`

2. **File Upload Fails**
   - Check disk space: `df -h`
   - Verify file size limits in configuration

3. **High Memory Usage**
   - Monitor with: `docker stats`
   - Adjust `MAX_FILE_SIZE` if needed

4. **SSL Certificate Issues**
   - Verify certificate files exist and are readable
   - Check certificate expiration: `openssl x509 -in cert.pem -text -noout`

#### Useful Commands

```bash
# Check service status
pm2 status
curl http://localhost:3001/health

# Check MinIO status
docker logs minio
curl http://localhost:9000/minio/health/live

# View real-time logs
pm2 logs minio-service --lines 100

# Restart services
pm2 restart minio-service
docker-compose restart minio

# Check disk usage
df -h
du -sh /data/minio/*
```

This deployment guide provides a comprehensive approach to deploying the MinIO microservice in production environments, with specific focus on Oracle Cloud Infrastructure.
