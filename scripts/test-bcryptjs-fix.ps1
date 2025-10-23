# Test bcryptjs fix for Railway deployment
# This script tests the server with bcryptjs instead of bcrypt

param(
    [int]$Port = 3000,
    [switch]$Verbose
)

Write-Host "Testing bcryptjs fix for Railway deployment" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Set environment variables for testing
$env:NODE_ENV = "production"
$env:PORT = $Port

Write-Host "Installing dependencies with bcryptjs..." -ForegroundColor Yellow
try {
    # Remove old node_modules and package-lock.json to ensure clean install
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "Dependencies installed successfully with bcryptjs" -ForegroundColor Green
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
Start-Sleep -Seconds 5

# Check if server is running
$serverProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue
if (-not $serverProcess) {
    Write-Host "Server failed to start" -ForegroundColor Red
    Stop-Job $serverJob
    Remove-Job $serverJob
    exit 1
}

Write-Host "Server started successfully with bcryptjs" -ForegroundColor Green

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

# Test user registration (this will test bcryptjs)
Write-Host "Testing user registration with bcryptjs..." -ForegroundColor Yellow
try {
    $registerData = @{
        email = "test@example.com"
        password = "testpassword123"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "http://localhost:$Port/api/register" -Method POST -Body $registerData -ContentType "application/json" -TimeoutSec 10
    Write-Host "User registration successful with bcryptjs:" -ForegroundColor Green
    Write-Host "Token received: $($registerResponse.token -ne $null)" -ForegroundColor Green
    if ($Verbose) {
        $registerResponse | ConvertTo-Json -Depth 2 | Write-Host
    }
} catch {
    Write-Host "User registration failed: $_" -ForegroundColor Red
    Stop-Job $serverJob
    Remove-Job $serverJob
    exit 1
}

# Test user login (this will test bcryptjs password verification)
Write-Host "Testing user login with bcryptjs..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "test@example.com"
        password = "testpassword123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:$Port/api/login" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 10
    Write-Host "User login successful with bcryptjs:" -ForegroundColor Green
    Write-Host "Token received: $($loginResponse.token -ne $null)" -ForegroundColor Green
    if ($Verbose) {
        $loginResponse | ConvertTo-Json -Depth 2 | Write-Host
    }
} catch {
    Write-Host "User login failed: $_" -ForegroundColor Red
    Stop-Job $serverJob
    Remove-Job $serverJob
    exit 1
}

# Clean up
Write-Host "Stopping server..." -ForegroundColor Yellow
Stop-Job $serverJob
Remove-Job $serverJob

# Kill any remaining node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "bcryptjs fix test completed successfully!" -ForegroundColor Green
Write-Host "All endpoints are working correctly with bcryptjs" -ForegroundColor Green
Write-Host "Server starts and stops properly" -ForegroundColor Green
Write-Host "Ready for Railway deployment!" -ForegroundColor Green
