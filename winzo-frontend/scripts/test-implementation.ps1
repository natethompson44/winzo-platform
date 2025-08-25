# Winzo Front-End Implementation Test
# PowerShell script to verify the implementation

Write-Host "Testing Winzo Front-End Implementation..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Check file structure
$requiredFiles = @(
    "index.html",
    "sport_template.html", 
    "style.css",
    "script.js",
    "README.md"
)

Write-Host "Checking required files..." -ForegroundColor Yellow
$allFilesExist = $true

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

# Check file sizes
Write-Host "Checking file sizes..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        $sizeKB = [math]::Round($size / 1KB, 2)
        Write-Host "$file - $sizeKB KB" -ForegroundColor Cyan
    }
}

Write-Host ""

# Check HTML structure
Write-Host "Checking HTML structure..." -ForegroundColor Yellow
if (Test-Path "index.html") {
    $htmlContent = Get-Content "index.html" -Raw
    
    # Check for key elements
    $checks = @{
        "Header with navigation" = $htmlContent -match '<header'
        "Main content area" = $htmlContent -match '<main'
        "Footer" = $htmlContent -match '<footer'
        "CSS link" = $htmlContent -match 'style\.css'
        "JavaScript link" = $htmlContent -match 'script\.js'
        "Button components" = $htmlContent -match 'btn btn-primary'
        "Form elements" = $htmlContent -match 'form-input'
        "Grid layout" = $htmlContent -match 'grid-demo'
    }
    
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "✓ $($check.Key)" -ForegroundColor Green
        } else {
            Write-Host "✗ $($check.Key)" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Check CSS structure
Write-Host "Checking CSS structure..." -ForegroundColor Yellow
if (Test-Path "style.css") {
    $cssContent = Get-Content "style.css" -Raw
    
    $cssChecks = @{
        "CSS Variables" = $cssContent -match 'root'
        "Color palette" = $cssContent -match '--primary'
        "Typography" = $cssContent -match '--font-primary'
        "Responsive breakpoints" = $cssContent -match 'media'
        "Button styles" = $cssContent -match '\.btn'
        "Form styles" = $cssContent -match '\.form-input'
        "Grid system" = $cssContent -match '\.grid-demo'
    }
    
    foreach ($check in $cssChecks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "✓ $($check.Key)" -ForegroundColor Green
        } else {
            Write-Host "✗ $($check.Key)" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Check JavaScript structure
Write-Host "Checking JavaScript structure..." -ForegroundColor Yellow
if (Test-Path "script.js") {
    $jsContent = Get-Content "script.js" -Raw
    
    $jsChecks = @{
        "Mobile navigation" = $jsContent -match 'initMobileNavigation'
        "Button interactions" = $jsContent -match 'initButtonInteractions'
        "Form validation" = $jsContent -match 'initFormValidation'
        "Accessibility features" = $jsContent -match 'initAccessibilityFeatures'
        "Event listeners" = $jsContent -match 'addEventListener'
        "Sports template" = $jsContent -match 'initSportsTemplate'
    }
    
    foreach ($check in $jsChecks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "✓ $($check.Key)" -ForegroundColor Green
        } else {
            Write-Host "✗ $($check.Key)" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Summary
if ($allFilesExist) {
    Write-Host "Implementation Status: COMPLETE" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open index.html in your browser" -ForegroundColor White
    Write-Host "2. Test responsive design by resizing browser" -ForegroundColor White
    Write-Host "3. Test mobile navigation on small screens" -ForegroundColor White
    Write-Host "4. Test form validation and button interactions" -ForegroundColor White
    Write-Host "5. Navigate to sport_template.html to test sports page" -ForegroundColor White
} else {
    Write-Host "Implementation Status: INCOMPLETE" -ForegroundColor Red
    Write-Host "Please ensure all required files are present." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
