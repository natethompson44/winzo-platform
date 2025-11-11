#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Creates an admin user for the WINZO platform
.DESCRIPTION
    This script creates a new admin user or updates an existing user to admin status.
    It properly hashes the password and sets the is_admin flag to true.
.PARAMETER Email
    The email address for the admin user
.PARAMETER Password
    The password for the admin user
.PARAMETER UpdateExisting
    If specified, updates an existing user to admin status instead of creating new user
.EXAMPLE
    .\create-admin-user.ps1 -Email "admin@winzo.com" -Password "admin123"
.EXAMPLE
    .\create-admin-user.ps1 -Email "existing@user.com" -Password "newpass" -UpdateExisting
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [switch]$UpdateExisting
)

# Validate email format
if ($Email -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') {
    Write-Error "Invalid email format"
    exit 1
}

# Validate password length
if ($Password.Length -lt 6) {
    Write-Error "Password must be at least 6 characters long"
    exit 1
}

# Find the project root directory (where .env file is located)
$projectRoot = $PSScriptRoot
while ($projectRoot -and -not (Test-Path (Join-Path $projectRoot ".env"))) {
    $projectRoot = Split-Path $projectRoot -Parent
}

if (-not $projectRoot -or -not (Test-Path (Join-Path $projectRoot ".env"))) {
    Write-Error ".env file not found. Please ensure you're running this from within the project directory structure."
    exit 1
}

# Change to project root directory
Set-Location $projectRoot
Write-Host "Working from project root: $projectRoot" -ForegroundColor Gray

# Load environment variables
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Error "DATABASE_URL environment variable not set in .env file"
    exit 1
}

Write-Host "Creating admin user..." -ForegroundColor Yellow

# Create Node.js script content
$nodeScript = @'
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdminUser(email, password, updateExisting) {
    try {
        console.log('Processing admin user...');
        
        // Check if user already exists
        const existingUser = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
        
        if (existingUser.rows.length > 0) {
            if (updateExisting) {
                console.log('User exists. Updating to admin...');
                
                // Hash the new password
                const saltRounds = 10;
                const passwordHash = await bcrypt.hash(password, saltRounds);
                
                // Update existing user to admin with new password
                await pool.query('UPDATE users SET is_admin = true, password_hash = $1 WHERE email = $2', [passwordHash, email]);
                console.log('User updated to admin successfully!');
            } else {
                console.log('User already exists. Use -UpdateExisting flag to update existing user.');
                console.log('Or use a different email address.');
                process.exit(1);
            }
        } else {
            console.log('Creating new admin user...');
            
            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            // Create new admin user
            const result = await pool.query(
                'INSERT INTO users (email, password_hash, balance, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, email, balance, is_admin',
                [email, passwordHash, 1000.00, true]
            );
            
            const newUser = result.rows[0];
            console.log('Admin user created successfully!');
            console.log('ID: ' + newUser.id);
            console.log('Balance: $' + newUser.balance);
        }
        
        console.log('Email: ' + email);
        console.log('Password: ' + password);
        console.log('Admin Status: true');
        
    } catch (error) {
        console.error('Error processing admin user:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

const email = process.argv[2];
const password = process.argv[3];
const updateExisting = process.argv[4] === 'true';

createAdminUser(email, password, updateExisting);
'@

# Write temporary script file
$tempScript = "temp-admin-script.js"
$nodeScript | Out-File -FilePath $tempScript -Encoding UTF8

try {
    # Run the Node.js script
    $updateFlag = if ($UpdateExisting) { "true" } else { "false" }
    node $tempScript $Email $Password $updateFlag
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nAdmin user setup completed successfully!" -ForegroundColor Green
        Write-Host "You can now log in with these credentials to access the admin dashboard." -ForegroundColor Cyan
    } else {
        Write-Error "Failed to create admin user"
        exit 1
    }
} finally {
    # Clean up temporary file
    if (Test-Path $tempScript) {
        Remove-Item $tempScript
    }
}