# Quick test script to verify migration
# Run: powershell -ExecutionPolicy Bypass -File scripts/test-migration.ps1

Write-Host "Testing migration setup..." -ForegroundColor Cyan
Write-Host ""

# Check if key files exist
$filesToCheck = @(
    "server/_core/index.ts",
    "client/src/main.tsx",
    "drizzle/schema.ts",
    "package.json",
    "railway.toml",
    "netlify.toml"
)

Write-Host "Checking key files..." -ForegroundColor Yellow
foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MISSING!" -ForegroundColor Red
    }
}

Write-Host ""

# Check if old files are gone
$oldFiles = @(
    "backend",
    "index.html",
    "package-lock.json",
    "odds.json"
)

Write-Host "Checking old files are removed..." -ForegroundColor Yellow
$allRemoved = $true
foreach ($file in $oldFiles) {
    if (Test-Path $file) {
        Write-Host "  ✗ $file still exists!" -ForegroundColor Red
        $allRemoved = $false
    } else {
        Write-Host "  ✓ $file removed" -ForegroundColor Green
    }
}

Write-Host ""

# Check package.json scripts
Write-Host "Checking package.json scripts..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.scripts.dev) {
    Write-Host "  ✓ dev script exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ dev script missing!" -ForegroundColor Red
}

if ($packageJson.scripts.build) {
    Write-Host "  ✓ build script exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ build script missing!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allRemoved) {
    Write-Host "✅ Migration looks good!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: pnpm dev" -ForegroundColor White
    Write-Host "2. Open: http://localhost:3000" -ForegroundColor White
} else {
    Write-Host "⚠️  Some old files still exist. Run cleanup script." -ForegroundColor Yellow
}


