# Winzo Front-End Development Server
# PowerShell script to start a local development server

param(
    [int]$Port = 8000,
    [string]$Directory = "."
)

Write-Host "Starting Winzo Front-End Development Server..." -ForegroundColor Green
Write-Host "Port: $Port" -ForegroundColor Yellow
Write-Host "Directory: $Directory" -ForegroundColor Yellow
Write-Host ""

# Check if Python is available
$pythonCommand = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCommand = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCommand = "python3"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCommand = "py"
}

# Check if Node.js serve is available
$nodeCommand = $null
if (Get-Command npx -ErrorAction SilentlyContinue) {
    $nodeCommand = "npx serve"
}

# Try to start server
if ($pythonCommand) {
    Write-Host "Starting Python HTTP server..." -ForegroundColor Cyan
    try {
        & $pythonCommand -m http.server $Port
    } catch {
        Write-Host "Failed to start Python server: $_" -ForegroundColor Red
    }
} elseif ($nodeCommand) {
    Write-Host "Starting Node.js serve..." -ForegroundColor Cyan
    try {
        Set-Location $Directory
        & npx serve . -p $Port
    } catch {
        Write-Host "Failed to start Node.js server: $_" -ForegroundColor Red
    }
} else {
    Write-Host "No suitable server found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install one of the following:" -ForegroundColor Yellow
    Write-Host "  - Python (python.org)" -ForegroundColor White
    Write-Host "  - Node.js (nodejs.org)" -ForegroundColor White
    Write-Host ""
    Write-Host "Or manually open index.html in your browser." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
