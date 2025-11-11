# Install dependencies script for Windows PowerShell
# This script installs all dependencies using pnpm

Write-Host "Installing dependencies..." -ForegroundColor Cyan

# Check if pnpm is installed
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm is not installed. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Install dependencies
Write-Host "Running pnpm install..." -ForegroundColor Cyan
pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to install dependencies. Exit code: $LASTEXITCODE" -ForegroundColor Red
    exit 1
}


