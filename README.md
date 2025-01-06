# NHIF Student Registration System - Deployment Guide

[... Previous content remains the same ...]

## macOS Deployment Guide

### Prerequisites for macOS

#### Software Requirements
- Homebrew (Package Manager)
- Node.js (v18+)
- npm (v9+)
- Docker Desktop for Mac
- Xcode Command Line Tools

### 1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Required Tools
```bash
# Update Homebrew
brew update

# Install Node.js
brew install node@18

# Install Git
brew install git

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
```

### 3. Xcode Command Line Tools
```bash
xcode-select --install
```

### 4. Clone Repository
```bash
# Create projects directory
mkdir -p ~/Projects
cd ~/Projects

# Clone the repository
git clone https://github.com/your-organization/nhif-registration-system.git
cd nhif-registration-system
```

### 5. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Generate JWT Secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Edit .env file
nano .env
```

### 6. Frontend Setup
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

### 7. Local Development

#### Start Development Servers
```bash
# Backend (in backend directory)
npm run dev

# Frontend (in frontend directory)
npm run dev
```

### 8. Docker Deployment on macOS

#### Configure Docker Desktop
1. Open Docker Desktop
2. Go to Preferences > Resources
3. Allocate sufficient CPU and Memory
   - Recommended: 4 CPU, 8GB RAM

#### Build and Run Containers
```bash
# Build Docker containers
docker-compose -f docker-compose.yml build

# Start containers
docker-compose up -d

# Run database migrations
docker-compose exec backend npm run migrate
```

### 9. Accessing the Application
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### 10. Development Workflow

#### Git Workflow
```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name
```

### 11. Performance Optimization

#### Cleaning Docker Resources
```bash
# Remove unused containers
docker system prune -f

# Remove unused volumes
docker volume prune -f
```

### 12. Debugging on macOS

#### Check Logs
```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# System logs
log show --predicate 'process == "docker"' --last 1h
```

### 13. SSL Configuration for Local Development

#### Generate Self-Signed Certificate
```bash
# Install mkcert
brew install mkcert

# Install local CA
mkcert -install

# Generate certificates
mkdir -p ./nginx/ssl
mkcert -key-file ./nginx/ssl/key.pem -cert-file ./nginx/ssl/cert.pem localhost
```

### 14. Backup Strategy

#### Local Backup Script
```bash
#!/bin/bash

# Create backup directory
mkdir -p ~/Projects/nhif-backups

# Backup database
docker-compose exec backend sqlite3 /path/to/database/nhif.db ".backup '~/Projects/nhif-backups/nhif_backup_$(date +"%Y%m%d_%H%M%S").db'"
```

### 15. Performance Monitoring

#### macOS System Monitor
- Use Activity Monitor (Applications > Utilities)
- Monitor CPU, Memory, Energy, Disk, Network

#### Docker Desktop Monitoring
- Use built-in container and resource monitoring

### 16. Common macOS-Specific Troubleshooting

#### Port Conflicts
```bash
# Find processes using specific ports
sudo lsof -i :5000
sudo lsof -i :3000

# Kill processes if needed
kill -9 <PID>
```

#### Network Issues
```bash
# Flush DNS cache
sudo killall -HUP mDNSResponder

# Renew IP
sudo ipconfig set en0 DHCP
```

### 17. Continuous Integration

#### GitHub Actions for macOS
- Create `.github/workflows/macos.yml` for CI/CD

```yaml
name: macOS CI

on: [push, pull_request]

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
    
    - name: Install Dependencies
      run: |
        npm ci
        npm run build
    
    - name: Run Tests
      run: npm test
```

## Conclusion
This guide provides a comprehensive approach to developing and deploying the NHIF Registration System on macOS. Always ensure you're following the latest security best practices and keeping your dependencies up to date.

## License
[Your License Here]

## Support
For macOS-specific support, contact [your support email/contact]
