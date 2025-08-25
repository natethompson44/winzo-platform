# Simple Force Push Script
# Directly force pushes local changes to remote without confirmation

param(
    [string]$Branch = "master",
    [string]$Remote = "origin"
)

Write-Host "Force pushing local branch '$Branch' to remote '$Remote'..." -ForegroundColor Yellow
Write-Host "This will completely replace the remote branch with your local version." -ForegroundColor Red

git push --force $Remote $Branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Force push completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Force push failed!" -ForegroundColor Red
}
