const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ PostgreSQL database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL database connection error:', err);
    process.exit(-1);
});

// Initialize database tables
async function initializeDatabase() {
    try {
        console.log('🔄 Initializing database tables...');
        
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                balance NUMERIC(10,2) DEFAULT 1000.00,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Add is_admin column to existing users table if it doesn't exist
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
        `);

        // Create bets table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                match VARCHAR(255) NOT NULL,
                team VARCHAR(255) NOT NULL,
                odds NUMERIC(5,2) NOT NULL,
                stake NUMERIC(10,2) NOT NULL,
                potential_payout NUMERIC(10,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create transactions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(20) CHECK (type IN ('deposit', 'withdraw')),
                amount NUMERIC(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log('✅ Database tables initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
}

// Helper function to execute queries with error handling
async function query(text, params = []) {
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Helper function to execute transactions
async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    query,
    transaction,
    initializeDatabase
};
