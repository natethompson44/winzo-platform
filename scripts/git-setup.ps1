# Git Setup and Push Script for WINZO NFL Project
# This script initializes git, adds files, commits, and pushes to remote

param(
    [string]$RemoteUrl = "",
    [string]$CommitMessage = "Initial commit: WINZO NFL odds backend and frontend",
    [switch]$Force = $false
)

Write-Host "🚀 Starting Git Setup for WINZO NFL Project..." -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to initialize git repository"
        exit 1
    }
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Check git status
Write-Host "📊 Checking git status..." -ForegroundColor Yellow
git status

# Add files to staging
Write-Host "📦 Adding files to git staging..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to add files to staging"
    exit 1
}

# Check what's staged
Write-Host "📋 Files staged for commit:" -ForegroundColor Cyan
git diff --cached --name-only

# Create initial commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m $CommitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create commit"
    exit 1
}

# Check if remote is configured
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    if ($RemoteUrl -eq "") {
        Write-Host "⚠️  No remote URL provided. Please provide a remote URL to push to:" -ForegroundColor Yellow
        Write-Host "   .\git-setup.ps1 -RemoteUrl 'https://github.com/username/repo.git'" -ForegroundColor Cyan
        Write-Host "   Or manually add remote: git remote add origin <your-repo-url>" -ForegroundColor Cyan
        Write-Host "✅ Local commit created successfully!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
        git remote add origin $RemoteUrl
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to add remote origin"
            exit 1
        }
    }
} else {
    Write-Host "✅ Remote origin already configured: $remoteExists" -ForegroundColor Green
}

# Push to remote
Write-Host "🚀 Pushing to remote repository..." -ForegroundColor Yellow
if ($Force) {
    git push -u origin master --force
} else {
    git push -u origin master
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push to remote repository"
    Write-Host "💡 Try running with -Force flag if you need to overwrite remote history" -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Successfully pushed to remote repository!" -ForegroundColor Green
Write-Host "📊 Final git status:" -ForegroundColor Cyan
git status
