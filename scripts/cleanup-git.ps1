# Git Cleanup Script
# Removes node_modules from git tracking and cleans up

Write-Host "Cleaning up git repository..." -ForegroundColor Cyan

# Remove node_modules from git tracking (but keep files locally)
Write-Host "Removing node_modules from git tracking..." -ForegroundColor Yellow
git rm -r --cached node_modules 2>&1 | Out-Null

# Remove dist folder if tracked
if (git ls-files dist 2>&1 | Select-String -Pattern "dist" -Quiet) {
    Write-Host "Removing dist from git tracking..." -ForegroundColor Yellow
    git rm -r --cached dist 2>&1 | Out-Null
}

# Remove pnpm-lock.yaml if you want to use npm only (optional)
# Uncomment if you want to remove it:
# git rm --cached pnpm-lock.yaml 2>&1 | Out-Null

Write-Host "`n✅ Git cleanup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review changes: git status" -ForegroundColor White
Write-Host "2. Stage changes: git add ." -ForegroundColor White
Write-Host "3. Commit: git commit -m 'Migration: Remove node_modules from tracking'" -ForegroundColor White


