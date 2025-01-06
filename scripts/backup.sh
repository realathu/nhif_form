#!/bin/bash

# Create backup directory if it doesn't exist
mkdir -p ./backups

# Timestamp for backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup database
docker-compose exec nhif-app sqlite3 /app/database/nhif_registration.db ".backup './backups/nhif_backup_${TIMESTAMP}.db'"

# Optional: Compress backup
tar -czvf "./backups/nhif_backup_${TIMESTAMP}.tar.gz" "./backups/nhif_backup_${TIMESTAMP}.db"

# Optional: Remove old backups (older than 7 days)
find ./backups -type f -name "*.db" -mtime +7 -delete
find ./backups -type f -name "*.tar.gz" -mtime +7 -delete

echo "Database backup completed: nhif_backup_${TIMESTAMP}.db"
