#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Creates an admin user using Railway CLI
.DESCRIPTION
    This script uses Railway CLI to connect to the database and create an admin user
.PARAMETER Email
    The email address for the admin user
.PARAMETER Password
    The password for the admin user
.EXAMPLE
    .\create-admin-railway.ps1 -Email "admin@winzo.com" -Password "admin123"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$Password
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

Write-Host "Creating admin user via Railway..." -ForegroundColor Yellow

# Create a Node.js script that will run in Railway environment
$nodeScript = @'
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function createAdminUser(email, password) {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Processing admin user...');
        
        // Check if user already exists
        const existingUser = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
        
        if (existingUser.rows.length > 0) {
            console.log('User exists. Updating to admin...');
            
            // Hash the new password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            // Update existing user to admin with new password
            await pool.query('UPDATE users SET is_admin = true, password_hash = $1 WHERE email = $2', [passwordHash, email]);
            console.log('User updated to admin successfully!');
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

createAdminUser(email, password);
'@

# Write temporary script file
$tempScript = "temp-railway-admin-script.js"
$nodeScript | Out-File -FilePath $tempScript -Encoding UTF8

try {
    # Run the script using Railway CLI
    Write-Host "Running script in Railway environment..." -ForegroundColor Cyan
    railway run node $tempScript $Email $Password
    
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


