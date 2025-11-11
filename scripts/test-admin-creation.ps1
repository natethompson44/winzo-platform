#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Tests the admin user creation functionality
.DESCRIPTION
    This script tests creating an admin user and verifies it works correctly
#>

param(
    [string]$Email = "admin@winzo.com",
    [string]$Password = "admin123"
)

Write-Host "🧪 Testing Admin User Creation" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "scripts\create-admin-user.ps1")) {
    Write-Error "❌ Please run this script from the project root directory"
    exit 1
}

# Test 1: Create new admin user
Write-Host "`n📝 Test 1: Creating new admin user..." -ForegroundColor Yellow
Write-Host "Email: $Email" -ForegroundColor Gray
Write-Host "Password: $Password" -ForegroundColor Gray

try {
    & ".\scripts\create-admin-user.ps1" -Email $Email -Password $Password
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test 1 PASSED: Admin user created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Test 1 FAILED: Could not create admin user" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Test 1 FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Try to create the same user again (should fail)
Write-Host "`n📝 Test 2: Attempting to create duplicate user..." -ForegroundColor Yellow

try {
    & ".\scripts\create-admin-user.ps1" -Email $Email -Password $Password 2>&1 | Out-String | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✅ Test 2 PASSED: Correctly prevented duplicate user creation" -ForegroundColor Green
    } else {
        Write-Host "❌ Test 2 FAILED: Should have prevented duplicate user creation" -ForegroundColor Red
    }
} catch {
    Write-Host "✅ Test 2 PASSED: Correctly prevented duplicate user creation" -ForegroundColor Green
}

# Test 3: Update existing user to admin
Write-Host "`n📝 Test 3: Updating existing user to admin..." -ForegroundColor Yellow

try {
    & ".\scripts\create-admin-user.ps1" -Email $Email -Password "newpassword123" -UpdateExisting
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test 3 PASSED: Successfully updated existing user to admin" -ForegroundColor Green
    } else {
        Write-Host "❌ Test 3 FAILED: Could not update existing user to admin" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test 3 FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Admin User Creation Tests Completed!" -ForegroundColor Green
Write-Host "You can now log in with:" -ForegroundColor Cyan
Write-Host "  Email: $Email" -ForegroundColor White
Write-Host "  Password: newpassword123" -ForegroundColor White
Write-Host "`nTo access the admin dashboard, log in and navigate to the admin section." -ForegroundColor Yellow


