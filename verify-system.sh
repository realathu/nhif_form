#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check command success
check_command() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    }
}

# Verify Node.js and npm
echo "Checking Node.js and npm versions..."
node --version
check_command "Node.js is installed"

npm --version
check_command "npm is installed"

# Check backend dependencies
echo -e "\nChecking Backend Dependencies..."
cd backend
npm install
check_command "Backend dependencies installed"

# Check TypeScript compilation
npm run build
check_command "Backend TypeScript compilation"

# Check environment configuration
if [ ! -f .env ]; then
    cp .env.example .env
    check_command "Created .env file from example"
fi

# Verify database initialization
npm run migrate
check_command "Database migration successful"

# Run backend tests (if available)
if npm test; then
    check_command "Backend tests passed"
else
    echo -e "${RED}✗ Backend tests failed${NC}"
fi

# Return to project root
cd ..

# Verify frontend dependencies
echo -e "\nChecking Frontend Dependencies..."
cd frontend
npm install
check_command "Frontend dependencies installed"

# Build frontend
npm run build
check_command "Frontend build successful"

echo -e "\n${GREEN}System Verification Complete!${NC}"
