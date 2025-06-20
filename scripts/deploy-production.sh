#!/bin/bash

# WINZO Platform Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 WINZO Platform Production Deployment Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "winzo-frontend" ] || [ ! -d "winzo-backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Set environment variables
export NODE_ENV=production
export CI=true
export GENERATE_SOURCEMAP=false

print_status "Environment set to production"

# Frontend deployment
print_status "Starting frontend deployment..."

cd winzo-frontend

# Install dependencies
print_status "Installing frontend dependencies..."
npm ci --only=production

# Run linting
print_status "Running frontend linting..."
npm run lint

# Run type checking
print_status "Running frontend type checking..."
npm run type-check

# Build frontend
print_status "Building frontend for production..."
npm run build

print_success "Frontend build completed successfully!"

cd ..

# Backend deployment
print_status "Starting backend deployment..."

cd winzo-backend

# Install dependencies
print_status "Installing backend dependencies..."
npm ci --only=production

# Run linting
print_status "Running backend linting..."
npm run lint

# Run database migrations
print_status "Running database migrations..."
npm run migrate:prod

print_success "Backend preparation completed successfully!"

cd ..

# Health checks
print_status "Running health checks..."

# Check if frontend build exists
if [ ! -d "winzo-frontend/build" ]; then
    print_error "Frontend build directory not found"
    exit 1
fi

# Check if backend can start
cd winzo-backend
if npm run healthcheck; then
    print_success "Backend health check passed"
else
    print_error "Backend health check failed"
    exit 1
fi
cd ..

print_success "All health checks passed!"

# Deployment summary
echo ""
print_success "🎯 WINZO Platform Production Deployment Summary:"
echo "  ✅ Frontend: Built and optimized"
echo "  ✅ Backend: Linted and migrated"
echo "  ✅ Health checks: All passed"
echo ""
print_status "Next steps:"
echo "  1. Deploy backend to Railway: railway up"
echo "  2. Deploy frontend to Netlify: netlify deploy --prod"
echo "  3. Update environment variables in production"
echo "  4. Run final smoke tests"
echo ""

print_success "🚀 WINZO Platform is ready for production deployment!" 