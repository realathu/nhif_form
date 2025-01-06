# NHIF Student Registration System

## Prerequisites
- Docker
- Docker Compose
- Node.js 18+

## Environment Setup
1. Copy `.env.production` to `.env`
2. Generate a secure JWT secret
3. Configure allowed origins

## Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Production Deployment
```bash
# Build and start containers
docker-compose up -d --build

# Run database migrations
docker-compose exec nhif-app npm run migrate
```

## Backup
```bash
# Create database backup
./scripts/backup.sh
```

## Security
- Use strong, unique JWT secret
- Configure CORS origins
- Regularly update dependencies

## Monitoring
- Check logs: `docker-compose logs nhif-app`
- Health check: `curl http://localhost:5000/health`
