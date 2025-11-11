# Force Git Cleanup Script
# Safely removes large directories from Git tracking without running git status
# This script avoids the crash that happens with 10K+ tracked files

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Force Git Cleanup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host ""
    Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Error "Not a git repository. Run this script from the repository root."
    exit 1
}

# Function to safely remove directory from Git tracking
function Remove-FromGitTracking {
    param(
        [string]$Path,
        [string]$Description
    )
    
    Write-Host ""
    Write-Host "Checking: $Description ($Path)..." -ForegroundColor Yellow
    
    # Check if any files in this path are tracked (without running full status)
    $trackedFiles = git ls-files "$Path" 2>&1
    
    if ($LASTEXITCODE -eq 0 -and $trackedFiles) {
        $fileCount = ($trackedFiles -split "`n").Count
        Write-Host "   Found $fileCount tracked files" -ForegroundColor White
        
        if (-not $DryRun) {
            Write-Host "   Removing from Git tracking (keeping local files)..." -ForegroundColor Yellow
            git rm -r --cached "$Path" 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   [OK] Removed $Path from tracking" -ForegroundColor Green
            } else {
                Write-Host "   [WARNING] Some files may have already been removed" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   [DRY RUN] Would remove $Path from tracking" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   [OK] Not tracked in Git (or doesn't exist)" -ForegroundColor Green
    }
}

# Function to clean up .gitignore
function Clean-GitIgnore {
    Write-Host ""
    Write-Host "Cleaning up .gitignore..." -ForegroundColor Yellow
    
    if (-not (Test-Path ".gitignore")) {
        Write-Host "   [WARNING] .gitignore not found" -ForegroundColor Yellow
        return
    }
    
    $content = Get-Content ".gitignore" -Raw
    $lines = Get-Content ".gitignore"
    
    # Remove duplicates while preserving order
    $seen = @{}
    $cleaned = @()
    
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq "" -or $trimmed.StartsWith("#")) {
            # Keep empty lines and comments
            $cleaned += $line
        } elseif (-not $seen.ContainsKey($trimmed)) {
            $seen[$trimmed] = $true
            $cleaned += $line
        }
    }
    
    if (-not $DryRun) {
        $cleaned | Set-Content ".gitignore" -NoNewline
        Write-Host "   [OK] Removed duplicates from .gitignore" -ForegroundColor Green
    } else {
        Write-Host "   [DRY RUN] Would clean .gitignore (removed $($lines.Count - $cleaned.Count) duplicate lines)" -ForegroundColor Cyan
    }
}

# Main cleanup process
Write-Host ""
Write-Host "Scanning for tracked large directories..." -ForegroundColor Cyan

# Remove common large directories from tracking
Remove-FromGitTracking "node_modules" "Node modules"
Remove-FromGitTracking "node_modules/" "Node modules (with slash)"
Remove-FromGitTracking "dist" "Dist folder"
Remove-FromGitTracking "build" "Build folder"
Remove-FromGitTracking ".next" "Next.js build"
Remove-FromGitTracking ".cache" "Cache folder"
Remove-FromGitTracking ".parcel-cache" "Parcel cache"
Remove-FromGitTracking "coverage" "Coverage reports"

# Clean up .gitignore
Clean-GitIgnore

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "DRY RUN COMPLETE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run without -DryRun to apply changes:" -ForegroundColor White
    Write-Host "   .\scripts\force-cleanup-git.ps1" -ForegroundColor Cyan
} else {
    Write-Host "CLEANUP COMPLETE" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Review what was removed:" -ForegroundColor White
    Write-Host "   git diff --cached --name-only | Select-Object -First 20" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Stage the .gitignore update:" -ForegroundColor White
    Write-Host "   git add .gitignore" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Commit the cleanup:" -ForegroundColor White
    Write-Host "   git commit -m 'Cleanup: Remove node_modules and large dirs from Git tracking'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. After committing, git status should work normally again!" -ForegroundColor Green
}

Write-Host ""

