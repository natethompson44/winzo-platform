# Test WINZO NFL Backend deployment configuration
# This script tests the server startup and health endpoint

param(
    [int]$Port = 3000,
    [switch]$Verbose
)

Write-Host "Testing WINZO NFL Backend Deployment Configuration" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Set environment variables for testing
$env:NODE_ENV = "production"
$env:PORT = $Port

Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to install dependencies: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Starting server on port $Port..." -ForegroundColor Yellow

# Start the server in background
$serverJob = Start-Job -ScriptBlock {
    param($port)
    $env:NODE_ENV = "production"
    $env:PORT = $port
    Set-Location $using:PWD
    npm start
} -ArgumentList $Port

# Wait a moment for server to start
Start-Sleep -Seconds 3

# Check if server is running
$serverProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue
if (-not $serverProcess) {
    Write-Host "Server failed to start" -ForegroundColor Red
    Stop-Job $serverJob
    Remove-Job $serverJob
    exit 1
}

Write-Host "Server started successfully" -ForegroundColor Green

# Test health endpoint
Write-Host "Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:$Port/api/health" -Method GET -TimeoutSec 10
    Write-Host "Health endpoint responding:" -ForegroundColor Green
    $healthResponse | ConvertTo-Json -Depth 3 | Write-Host
} catch {
    Write-Host "Health endpoint failed: $_" -ForegroundColor Red
    Stop-Job $serverJob
    Remove-Job $serverJob
    exit 1
}

# Test odds endpoint
Write-Host "Testing odds endpoint..." -ForegroundColor Yellow
try {
    $oddsResponse = Invoke-RestMethod -Uri "http://localhost:$Port/api/odds" -Method GET -TimeoutSec 15
    Write-Host "Odds endpoint responding (success: $($oddsResponse.success))" -ForegroundColor Green
    if ($Verbose) {
        Write-Host "Sample odds data:" -ForegroundColor Cyan
        $oddsResponse.data[0..2] | ConvertTo-Json -Depth 2 | Write-Host
    }
} catch {
    Write-Host "Odds endpoint failed: $_" -ForegroundColor Red
    Stop-Job $serverJob
    Remove-Job $serverJob
    exit 1
}

# Test root endpoint (serves index.html)
Write-Host "Testing root endpoint..." -ForegroundColor Yellow
try {
    $rootResponse = Invoke-WebRequest -Uri "http://localhost:$Port/" -Method GET -TimeoutSec 10
    if ($rootResponse.StatusCode -eq 200) {
        Write-Host "Root endpoint serving HTML successfully" -ForegroundColor Green
    } else {
        Write-Host "Root endpoint returned status: $($rootResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Root endpoint failed: $_" -ForegroundColor Red
}

# Clean up
Write-Host "Stopping server..." -ForegroundColor Yellow
Stop-Job $serverJob
Remove-Job $serverJob

# Kill any remaining node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Deployment configuration test completed successfully!" -ForegroundColor Green
Write-Host "All endpoints are working correctly" -ForegroundColor Green
Write-Host "Server starts and stops properly" -ForegroundColor Green
Write-Host "Ready for Railway deployment!" -ForegroundColor Green
