# Test script for wallet functionality
Write-Host "Testing WINZO Wallet Functionality..." -ForegroundColor Green

# Wait for server to start
Start-Sleep -Seconds 3

# Test user registration
Write-Host "`n1. Testing user registration..." -ForegroundColor Yellow
$registerBody = @{
    email = "test@example.com"
    password = "testpass123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host "User balance: `$$($registerResponse.user.balance)" -ForegroundColor Cyan
    $token = $registerResponse.token
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test wallet balance
Write-Host "`n2. Testing wallet balance..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $balanceResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/wallet" -Method GET -Headers $headers
    Write-Host "Current balance: `$$($balanceResponse.balance)" -ForegroundColor Cyan
} catch {
    Write-Host "Balance check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test deposit
Write-Host "`n3. Testing deposit..." -ForegroundColor Yellow
try {
    $depositBody = @{ amount = 100 } | ConvertTo-Json
    $depositResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/deposit" -Method POST -Body $depositBody -ContentType "application/json" -Headers $headers
    Write-Host "Deposit successful!" -ForegroundColor Green
    Write-Host "New balance: `$$($depositResponse.balance)" -ForegroundColor Cyan
} catch {
    Write-Host "Deposit failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test bet placement
Write-Host "`n4. Testing bet placement..." -ForegroundColor Yellow
try {
    $betBody = @{
        match = "Test Team A vs Test Team B"
        team = "Test Team A"
        odds = 1.85
        stake = 50
        potential_payout = 92.5
    } | ConvertTo-Json
    
    $betResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/bet" -Method POST -Body $betBody -ContentType "application/json" -Headers $headers
    Write-Host "Bet placed successfully!" -ForegroundColor Green
    Write-Host "New balance: `$$($betResponse.new_balance)" -ForegroundColor Cyan
} catch {
    Write-Host "Bet placement failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test insufficient funds
Write-Host "`n5. Testing insufficient funds..." -ForegroundColor Yellow
try {
    $bigBetBody = @{
        match = "Test Team A vs Test Team B"
        team = "Test Team A"
        odds = 1.85
        stake = 2000
        potential_payout = 3700
    } | ConvertTo-Json
    
    $bigBetResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/bet" -Method POST -Body $bigBetBody -ContentType "application/json" -Headers $headers
    Write-Host "Unexpected: Big bet was allowed!" -ForegroundColor Red
} catch {
    Write-Host "Expected: Insufficient funds error caught" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Cyan
}

Write-Host "`nWallet functionality test completed!" -ForegroundColor Green
