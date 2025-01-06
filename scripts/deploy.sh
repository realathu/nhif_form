#!/bin/bash

# Exit on first error
set -e

# Load environment variables
source .env.production

# Pull latest changes
git pull origin main

# Build Docker images
docker-compose build

# Stop existing containers
docker-compose down

# Start new containers
docker-compose up -d

# Run database migrations
docker-compose exec nhif-app npm run migrate

# Cleanup old images and volumes
docker image prune -f
docker volume prune -f

echo "Deployment completed successfully!"
