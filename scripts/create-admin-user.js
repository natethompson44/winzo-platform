#!/usr/bin/env node

/**
 * Script to create an admin user for testing the WINZO admin dashboard
 * Usage: node scripts/create-admin-user.js <email> <password>
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdminUser(email, password) {
    try {
        console.log('🔄 Creating admin user...');
        
        // Check if user already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            console.log('⚠️  User already exists. Updating to admin...');
            
            // Update existing user to admin
            await pool.query('UPDATE users SET is_admin = true WHERE email = $1', [email]);
            console.log('✅ User updated to admin successfully!');
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 Password: ${password}`);
            console.log(`👑 Admin Status: true`);
            return;
        }
        
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Create new admin user
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, balance, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, email, balance, is_admin',
            [email, passwordHash, 1000.00, true]
        );
        
        const newUser = result.rows[0];
        
        console.log('✅ Admin user created successfully!');
        console.log(`🆔 ID: ${newUser.id}`);
        console.log(`📧 Email: ${newUser.email}`);
        console.log(`💰 Balance: $${newUser.balance}`);
        console.log(`👑 Admin Status: ${newUser.is_admin}`);
        console.log(`🔑 Password: ${password}`);
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node scripts/create-admin-user.js <email> <password>');
    console.log('Example: node scripts/create-admin-user.js admin@winzo.com admin123');
    process.exit(1);
}

const [email, password] = args;

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format');
    process.exit(1);
}

// Validate password length
if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters long');
    process.exit(1);
}

createAdminUser(email, password);
