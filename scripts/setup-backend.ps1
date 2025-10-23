# WINZO NFL Backend Setup Script
# This script installs dependencies and starts the Express server

param(
    [switch]$Install,
    [switch]$Start,
    [switch]$Dev
)

$ErrorActionPreference = "Stop"

Write-Host "🏈 WINZO NFL Backend Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not available" -ForegroundColor Red
    exit 1
}

# Install dependencies
if ($Install -or $Start -or $Dev) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    
    try {
        npm install
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        exit 1
    }
}

# Start the server
if ($Start -or $Dev) {
    Write-Host "🚀 Starting WINZO NFL Backend..." -ForegroundColor Yellow
    Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "API endpoint: http://localhost:3000/api/odds" -ForegroundColor Cyan
    Write-Host "Health check: http://localhost:3000/api/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host "=========================" -ForegroundColor Cyan
    
    try {
        if ($Dev) {
            npm run dev
        } else {
            npm start
        }
    } catch {
        Write-Host "❌ Failed to start server" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        exit 1
    }
}

# Show usage if no parameters provided
if (-not ($Install -or $Start -or $Dev)) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\setup-backend.ps1 -Install    # Install dependencies only" -ForegroundColor White
    Write-Host "  .\scripts\setup-backend.ps1 -Start      # Install and start server" -ForegroundColor White
    Write-Host "  .\scripts\setup-backend.ps1 -Dev        # Install and start in dev mode" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\scripts\setup-backend.ps1 -Start" -ForegroundColor White
    Write-Host "  .\scripts\setup-backend.ps1 -Dev" -ForegroundColor White
}
