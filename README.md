# NHIF Student Registration System - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Server Requirements](#server-requirements)
5. [Configuration](#configuration)
6. [Security Considerations](#security-considerations)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Software Requirements
- Node.js (v18+ recommended)
- npm (v9+)
- Docker (v20+)
- Docker Compose (v2+)
- Git

### Server Specifications
- Minimum 2 CPU cores
- 4GB RAM
- 20GB Disk Space
- Ubuntu 20.04+ or similar Linux distribution

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-organization/nhif-registration-system.git
cd nhif-registration-system
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

#### Environment Variables
- `NODE_ENV`: Set to `development`
- `PORT`: Backend server port (default: 5000)
- `DATABASE_URL`: Path to SQLite database
- `JWT_SECRET`: Generate a secure random secret
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### 4. Start Development Servers
```bash
# Backend (in backend directory)
npm run dev

# Frontend (in frontend directory)
npm run dev
```

## Production Deployment

### Preparation

#### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y docker docker-compose nginx certbot python3-certbot-nginx
```

#### 2. Clone Repository on Production Server
```bash
git clone https://github.com/your-organization/nhif-registration-system.git
cd nhif-registration-system
```

#### 3. SSL Certificate Generation
```bash
# Stop any existing web services
sudo systemctl stop nginx

# Generate SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx with SSL
sudo nano /etc/nginx/sites-available/nhif-registration
```

#### 4. Configure Environment
```bash
# Create production environment file
cp .env.production .env

# Edit environment variables
nano .env

# Generate secure JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

### Deployment Steps

#### 5. Build and Deploy
```bash
# Build Docker containers
docker-compose -f docker-compose.prod.yml build

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose exec backend npm run migrate
```

#### 6. Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Automated Backup
```bash
# Create backup script
nano /path/to/backup.sh

# Add backup script content
#!/bin/bash
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker-compose exec backend sqlite3 /path/to/database/nhif.db ".backup '$BACKUP_DIR/nhif_backup_$TIMESTAMP.db'"

# Make script executable
chmod +x /path/to/backup.sh

# Set up cron job for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

## Security Considerations

### 1. Firewall Configuration
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Regular Updates
```bash
# Automatic security updates
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 3. Fail2Ban Installation
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Troubleshooting

### Common Issues
- Check Docker logs: `docker-compose logs backend`
- Verify container status: `docker-compose ps`
- Restart services: `docker-compose restart`

### Debugging
```bash
# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend

# Check network connectivity
docker network ls
docker network inspect nhif-registration-network
```

## Maintenance

### Database Migrations
```bash
# Run migrations
docker-compose exec backend npm run migrate

# Rollback migrations
docker-compose exec backend npm run migrate:rollback
```

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

### Performance Monitoring
- Use `htop` for system resources
- Docker stats: `docker stats`
- Nginx logs: `/var/log/nginx/access.log`

## License
[Your License Here]

## Support
For support, please contact [your support email/contact]
