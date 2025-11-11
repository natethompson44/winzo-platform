# PowerShell script to clean up old files
# Run: powershell -ExecutionPolicy Bypass -File scripts/cleanup-old-files.ps1

Write-Host "Cleaning up old files from vanilla JS/Express project..." -ForegroundColor Cyan

# Delete old backend folder
if (Test-Path "backend") {
    Write-Host "Deleting old backend/ folder..." -ForegroundColor Yellow
    Remove-Item -Path "backend" -Recurse -Force
    Write-Host "✓ Deleted backend/" -ForegroundColor Green
}

# Delete old index.html (root)
if (Test-Path "index.html") {
    Write-Host "Deleting old index.html..." -ForegroundColor Yellow
    Remove-Item -Path "index.html" -Force
    Write-Host "✓ Deleted index.html" -ForegroundColor Green
}

# Delete package-lock.json (we use pnpm)
if (Test-Path "package-lock.json") {
    Write-Host "Deleting package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Path "package-lock.json" -Force
    Write-Host "✓ Deleted package-lock.json" -ForegroundColor Green
}

# Delete old odds.json
if (Test-Path "odds.json") {
    Write-Host "Deleting old odds.json..." -ForegroundColor Yellow
    Remove-Item -Path "odds.json" -Force
    Write-Host "✓ Deleted odds.json" -ForegroundColor Green
}

# Delete old MySQL migration files
$oldMigrations = @(
    "drizzle\0000_slow_wraith.sql",
    "drizzle\0001_bizarre_obadiah_stane.sql",
    "drizzle\0002_broad_frightful_four.sql",
    "drizzle\0003_mute_yellowjacket.sql",
    "drizzle\meta\0000_snapshot.json"
)

foreach ($file in $oldMigrations) {
    if (Test-Path $file) {
        Write-Host "Deleting old migration: $file..." -ForegroundColor Yellow
        Remove-Item -Path $file -Force
        Write-Host "✓ Deleted $file" -ForegroundColor Green
    }
}

# Delete old test/setup scripts
$oldScripts = @(
    "scripts\create-admin-railway.ps1",
    "scripts\create-admin-user.js",
    "scripts\create-admin-user.ps1",
    "scripts\create-admin-user.sql",
    "scripts\test-admin-creation.ps1",
    "scripts\test-admin-dashboard.js",
    "scripts\test-admin-dashboard.ps1",
    "scripts\test-analytics.ps1",
    "scripts\test-bet-slip.ps1",
    "scripts\test-deployment.ps1",
    "scripts\test-postgresql.ps1",
    "scripts\test-wallet-ui.ps1",
    "scripts\test-wallet.ps1",
    "scripts\setup-backend.ps1"
)

foreach ($script in $oldScripts) {
    if (Test-Path $script) {
        Write-Host "Deleting old script: $script..." -ForegroundColor Yellow
        Remove-Item -Path $script -Force
        Write-Host "✓ Deleted $script" -ForegroundColor Green
    }
}

Write-Host "`n✅ Cleanup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Run: pnpm install" -ForegroundColor White
Write-Host "2. Run: pnpm dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White


