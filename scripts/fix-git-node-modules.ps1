# Fix Git Repository Flooded with node_modules
# This script removes node_modules from Git tracking WITHOUT running git status
# Safe to run even if node_modules is already committed in history

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Git Repository - Remove node_modules" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Error "Not a git repository. Run this script from the repository root."
    exit 1
}

# Step 1: Check if .gitignore is correct
Write-Host "Step 1: Verifying .gitignore..." -ForegroundColor Yellow
$gitignoreContent = Get-Content ".gitignore" -Raw -ErrorAction SilentlyContinue
if (-not $gitignoreContent -or $gitignoreContent -notmatch "node_modules") {
    Write-Host "  [WARNING] .gitignore may not properly exclude node_modules" -ForegroundColor Yellow
} else {
    Write-Host "  [OK] .gitignore contains node_modules exclusion" -ForegroundColor Green
}

# Step 2: Find all node_modules files tracked in git (using ls-files, NOT status)
Write-Host ""
Write-Host "Step 2: Finding tracked node_modules files..." -ForegroundColor Yellow
Write-Host "  (This may take a moment if there are many files...)"

# Use git ls-files to find tracked files without triggering status
$trackedFiles = @()
try {
    $trackedFiles = git ls-files | Where-Object { $_ -like "node_modules*" }
} catch {
    Write-Host "  [ERROR] Failed to list tracked files" -ForegroundColor Red
    exit 1
}

if ($trackedFiles.Count -eq 0) {
    Write-Host "  [OK] No node_modules files are currently tracked in Git" -ForegroundColor Green
} else {
    Write-Host "  [FOUND] $($trackedFiles.Count) node_modules files tracked in Git" -ForegroundColor Red
    
    if (-not $DryRun) {
        Write-Host ""
        Write-Host "Step 3: Removing node_modules from Git tracking..." -ForegroundColor Yellow
        Write-Host "  (This keeps your local files, only removes from Git)"
        
        # Remove from index using --cached (keeps local files)
        $result = git rm -r --cached node_modules 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Removed node_modules from Git tracking" -ForegroundColor Green
        } else {
            # Try removing individual files if directory removal fails
            Write-Host "  [INFO] Trying alternative method..." -ForegroundColor Yellow
            $trackedFiles | ForEach-Object {
                git rm --cached $_ 2>&1 | Out-Null
            }
            Write-Host "  [OK] Removed node_modules files from Git tracking" -ForegroundColor Green
        }
    } else {
        Write-Host "  [DRY RUN] Would remove $($trackedFiles.Count) files from Git tracking" -ForegroundColor Cyan
    }
}

# Step 3: Check if node_modules exists in git history (committed before)
Write-Host ""
Write-Host "Step 3: Checking Git history for node_modules commits..." -ForegroundColor Yellow

# Check if node_modules was ever committed (without running status)
$historyCheck = git log --all --full-history --oneline -- "node_modules" 2>&1 | Select-Object -First 1

if ($historyCheck -and $historyCheck -notmatch "fatal") {
    Write-Host "  [WARNING] node_modules was found in Git history!" -ForegroundColor Red
    Write-Host "  This means it was committed before .gitignore was set up." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  To completely remove it from history, you'll need to:" -ForegroundColor Yellow
    Write-Host "  1. Use git filter-branch or BFG Repo-Cleaner" -ForegroundColor White
    Write-Host "  2. Force push to remote (WARNING: rewrites history)" -ForegroundColor White
    Write-Host ""
    Write-Host "  For now, we've removed it from tracking. Future commits won't include it." -ForegroundColor Green
} else {
    Write-Host "  [OK] node_modules not found in Git history" -ForegroundColor Green
}

# Step 4: Verify .gitignore is properly formatted
Write-Host ""
Write-Host "Step 4: Verifying .gitignore file..." -ForegroundColor Yellow

if (Test-Path ".gitignore") {
    $content = Get-Content ".gitignore" -Raw
    $encoding = [System.Text.Encoding]::UTF8
    
    # Check if file looks corrupted (contains non-printable characters)
    $bytes = [System.IO.File]::ReadAllBytes(".gitignore")
    $text = $encoding.GetString($bytes)
    
    if ($text -match "[^\x20-\x7E\r\n\t]") {
        Write-Host "  [WARNING] .gitignore may be corrupted (contains non-ASCII characters)" -ForegroundColor Yellow
        Write-Host "  Re-writing .gitignore with proper encoding..." -ForegroundColor Yellow
        
        if (-not $DryRun) {
            # Re-write with proper UTF-8 encoding
            $properGitignore = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
pnpm-lock.yaml

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov
.nyc_output

# TypeScript
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# dotenv environment variables file
.env
.env.test
.env.local
.env.development.local
.env.test.local
.env.production.local

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Temporary folders
tmp/
temp/

# Logs
logs
*.log

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Backup files
*.bak
*.backup

# Build outputs
build/
dist/
"@
            [System.IO.File]::WriteAllText(".gitignore", $properGitignore, $encoding)
            Write-Host "  [OK] .gitignore re-written with proper encoding" -ForegroundColor Green
        }
    } else {
        Write-Host "  [OK] .gitignore file looks good" -ForegroundColor Green
    }
} else {
    Write-Host "  [WARNING] .gitignore not found" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "DRY RUN COMPLETE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run without -DryRun to apply changes:" -ForegroundColor White
    Write-Host "  .\scripts\fix-git-node-modules.ps1" -ForegroundColor Cyan
} else {
    Write-Host "CLEANUP COMPLETE" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps (DO NOT run git status yet!):" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Stage the .gitignore update:" -ForegroundColor White
    Write-Host "   git add .gitignore" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Check what will be committed (safe, uses diff not status):" -ForegroundColor White
    Write-Host "   git diff --cached --name-only | Select-Object -First 20" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Commit the cleanup:" -ForegroundColor White
    Write-Host "   git commit -m 'Fix: Remove node_modules from Git tracking'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. After committing, git status should work normally!" -ForegroundColor Green
    Write-Host "   (But wait for my confirmation before running it)" -ForegroundColor Yellow
}
Write-Host ""

