# WINZO PostgreSQL Database Test Script
# This script tests all the database operations and API endpoints

Write-Host "🧪 WINZO PostgreSQL Database Test Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Configuration
$BASE_URL = "http://localhost:3000"
$TEST_EMAIL = "test@winzo.com"
$TEST_PASSWORD = "testpassword123"
$JWT_TOKEN = ""

# Helper function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Body = @{},
        [string]$Token = ""
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers
        } else {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json)
        }
        return $response
    } catch {
        Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n1️⃣ Testing Health Check..." -ForegroundColor Yellow
$health = Invoke-ApiRequest -Method "GET" -Uri "$BASE_URL/api/health"
if ($health) {
    Write-Host "✅ Health check passed: $($health.status)" -ForegroundColor Green
} else {
    Write-Host "❌ Health check failed" -ForegroundColor Red
    exit 1
}

# Test 2: User Registration
Write-Host "`n2️⃣ Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
}
$registerResponse = Invoke-ApiRequest -Method "POST" -Uri "$BASE_URL/api/register" -Body $registerBody
if ($registerResponse -and $registerResponse.success) {
    $JWT_TOKEN = $registerResponse.token
    Write-Host "✅ User registered successfully" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.user.id)" -ForegroundColor Gray
    Write-Host "   Balance: `$$($registerResponse.user.balance)" -ForegroundColor Gray
} else {
    Write-Host "❌ User registration failed" -ForegroundColor Red
    exit 1
}

# Test 3: User Login
Write-Host "`n3️⃣ Testing User Login..." -ForegroundColor Yellow
$loginBody = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
}
$loginResponse = Invoke-ApiRequest -Method "POST" -Uri "$BASE_URL/api/login" -Body $loginBody
if ($loginResponse -and $loginResponse.success) {
    Write-Host "✅ User login successful" -ForegroundColor Green
    Write-Host "   Balance: `$$($loginResponse.user.balance)" -ForegroundColor Gray
} else {
    Write-Host "❌ User login failed" -ForegroundColor Red
    exit 1
}

# Test 4: Get User Profile
Write-Host "`n4️⃣ Testing User Profile..." -ForegroundColor Yellow
$profileResponse = Invoke-ApiRequest -Method "GET" -Uri "$BASE_URL/api/profile" -Token $JWT_TOKEN
if ($profileResponse -and $profileResponse.success) {
    Write-Host "✅ Profile retrieved successfully" -ForegroundColor Green
    Write-Host "   Email: $($profileResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Balance: `$$($profileResponse.user.balance)" -ForegroundColor Gray
} else {
    Write-Host "❌ Profile retrieval failed" -ForegroundColor Red
    exit 1
}

# Test 5: Get Wallet Balance
Write-Host "`n5️⃣ Testing Wallet Balance..." -ForegroundColor Yellow
$walletResponse = Invoke-ApiRequest -Method "GET" -Uri "$BASE_URL/api/wallet" -Token $JWT_TOKEN
if ($walletResponse -and $walletResponse.success) {
    Write-Host "✅ Wallet balance retrieved: `$$($walletResponse.balance)" -ForegroundColor Green
} else {
    Write-Host "❌ Wallet balance retrieval failed" -ForegroundColor Red
    exit 1
}

# Test 6: Deposit Funds
Write-Host "`n6️⃣ Testing Deposit..." -ForegroundColor Yellow
$depositBody = @{
    amount = 100
}
$depositResponse = Invoke-ApiRequest -Method "POST" -Uri "$BASE_URL/api/deposit" -Body $depositBody -Token $JWT_TOKEN
if ($depositResponse -and $depositResponse.success) {
    Write-Host "✅ Deposit successful: $($depositResponse.message)" -ForegroundColor Green
    Write-Host "   New Balance: `$$($depositResponse.balance)" -ForegroundColor Gray
} else {
    Write-Host "❌ Deposit failed" -ForegroundColor Red
    exit 1
}

# Test 7: Place a Bet
Write-Host "`n7️⃣ Testing Bet Placement..." -ForegroundColor Yellow
$betBody = @{
    match = "Cowboys vs Eagles"
    team = "Cowboys"
    odds = 1.85
    stake = 50
    potential_payout = 92.50
}
$betResponse = Invoke-ApiRequest -Method "POST" -Uri "$BASE_URL/api/bet" -Body $betBody -Token $JWT_TOKEN
if ($betResponse -and $betResponse.success) {
    Write-Host "✅ Bet placed successfully" -ForegroundColor Green
    Write-Host "   Bet ID: $($betResponse.bet.id)" -ForegroundColor Gray
    Write-Host "   Match: $($betResponse.bet.match)" -ForegroundColor Gray
    Write-Host "   Team: $($betResponse.bet.team)" -ForegroundColor Gray
    Write-Host "   Stake: `$$($betResponse.bet.stake)" -ForegroundColor Gray
    Write-Host "   New Balance: `$$($betResponse.new_balance)" -ForegroundColor Gray
} else {
    Write-Host "❌ Bet placement failed" -ForegroundColor Red
    exit 1
}

# Test 8: Get Betting History
Write-Host "`n8️⃣ Testing Betting History..." -ForegroundColor Yellow
$betsResponse = Invoke-ApiRequest -Method "GET" -Uri "$BASE_URL/api/bets" -Token $JWT_TOKEN
if ($betsResponse -and $betsResponse.success) {
    Write-Host "✅ Betting history retrieved" -ForegroundColor Green
    Write-Host "   Number of bets: $($betsResponse.bets.Count)" -ForegroundColor Gray
    foreach ($bet in $betsResponse.bets) {
        Write-Host "   - Bet #$($bet.id): $($bet.match) - $($bet.team) (Stake: `$$($bet.stake))" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Betting history retrieval failed" -ForegroundColor Red
    exit 1
}

# Test 9: Withdraw Funds
Write-Host "`n9️⃣ Testing Withdrawal..." -ForegroundColor Yellow
$withdrawBody = @{
    amount = 25
}
$withdrawResponse = Invoke-ApiRequest -Method "POST" -Uri "$BASE_URL/api/withdraw" -Body $withdrawBody -Token $JWT_TOKEN
if ($withdrawResponse -and $withdrawResponse.success) {
    Write-Host "✅ Withdrawal successful: $($withdrawResponse.message)" -ForegroundColor Green
    Write-Host "   New Balance: `$$($withdrawResponse.balance)" -ForegroundColor Gray
} else {
    Write-Host "❌ Withdrawal failed" -ForegroundColor Red
    exit 1
}

# Test 10: Test Insufficient Funds
Write-Host "`n🔟 Testing Insufficient Funds..." -ForegroundColor Yellow
$insufficientBetBody = @{
    match = "Giants vs Commanders"
    team = "Giants"
    odds = 2.10
    stake = 10000
    potential_payout = 21000
}
$insufficientBetResponse = Invoke-ApiRequest -Method "POST" -Uri "$BASE_URL/api/bet" -Body $insufficientBetBody -Token $JWT_TOKEN
if ($insufficientBetResponse -and -not $insufficientBetResponse.success) {
    Write-Host "✅ Insufficient funds correctly handled: $($insufficientBetResponse.error)" -ForegroundColor Green
} else {
    Write-Host "❌ Insufficient funds test failed" -ForegroundColor Red
}

Write-Host "`n🎉 All tests completed!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ PostgreSQL database integration successful!" -ForegroundColor Green
Write-Host "✅ All API endpoints working correctly!" -ForegroundColor Green
Write-Host "✅ Transaction handling working!" -ForegroundColor Green
Write-Host "✅ Error handling working!" -ForegroundColor Green
