# Force Push Script for Winzo Frontend
# This script will force push local changes to the remote repository
# WARNING: This will overwrite the remote branch completely with your local version

param(
    [string]$Branch = "master",
    [string]$Remote = "origin",
    [switch]$Force
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "=== Force Push Script ===" -ForegroundColor Yellow
Write-Host "Target Branch: $Branch" -ForegroundColor Cyan
Write-Host "Target Remote: $Remote" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Error "Not in a git repository. Please run this script from the project root."
    exit 1
}

# Check if force flag is set
if (-not $Force) {
    Write-Host "WARNING: This will completely overwrite the remote branch with your local version!" -ForegroundColor Red
    Write-Host "Use -Force flag to proceed without confirmation." -ForegroundColor Yellow
    $confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

try {
    Write-Host "Step 1: Checking current git status..." -ForegroundColor Green
    git status
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to get git status"
    }
    
    Write-Host ""
    Write-Host "Step 2: Force pushing local branch to remote..." -ForegroundColor Green
    Write-Host "This will replace everything on the remote branch with your local version." -ForegroundColor Yellow
    
    git push --force $Remote $Branch
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to force push to remote"
    }
    
    Write-Host ""
    Write-Host "Step 3: Verifying push..." -ForegroundColor Green
    git status
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to get git status"
    }
    
    Write-Host ""
    Write-Host "✅ Force push completed successfully!" -ForegroundColor Green
    Write-Host "Remote branch '$Branch' has been completely replaced with your local version." -ForegroundColor Green
    Write-Host "All remote changes have been overwritten." -ForegroundColor Yellow
    
} catch {
    Write-Error "❌ Force push failed: $($_.Exception.Message)"
    Write-Host "Please check your git configuration and try again." -ForegroundColor Red
    exit 1
}
