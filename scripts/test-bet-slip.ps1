# Test script for bet slip functionality
# This script opens the HTML file in a browser to test the bet slip functionality

Write-Host "Testing bet slip functionality..." -ForegroundColor Green

# Get the current directory
$currentDir = Get-Location
$htmlFile = Join-Path $currentDir "index.html"

if (Test-Path $htmlFile) {
    Write-Host "Opening $htmlFile in default browser..." -ForegroundColor Yellow
    Start-Process $htmlFile
    
    Write-Host "`nTest Instructions:" -ForegroundColor Cyan
    Write-Host "1. Open browser developer tools (F12)" -ForegroundColor White
    Write-Host "2. Go to Console tab" -ForegroundColor White
    Write-Host "3. Click on any team button to select a bet" -ForegroundColor White
    Write-Host "4. Check console for debug messages:" -ForegroundColor White
    Write-Host "   - 'selectBet triggered' should appear" -ForegroundColor Gray
    Write-Host "   - 'updateBetSlipToggle called' should appear" -ForegroundColor Gray
    Write-Host "   - 'Showing bet slip toggle with count: 1' should appear" -ForegroundColor Gray
    Write-Host "5. Verify orange floating bet slip button appears in bottom-right" -ForegroundColor White
    Write-Host "6. Click the floating button to open bet slip" -ForegroundColor White
    Write-Host "7. Click X to remove a bet and verify button disappears" -ForegroundColor White
    
    Write-Host "`nIf you see any errors in console, please report them." -ForegroundColor Red
} else {
    Write-Host "Error: index.html not found in current directory" -ForegroundColor Red
    Write-Host "Current directory: $currentDir" -ForegroundColor Yellow
}
