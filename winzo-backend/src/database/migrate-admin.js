const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Run the admin role migration
 */
async function runAdminMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Starting admin role migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'admin_role_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Admin role migration completed successfully!');
    console.log('📝 The role column has been added to the users table');
    console.log('🔧 You can now assign admin roles to users');
    
    // Show current users and their roles
    const result = await pool.query('SELECT id, username, email, role FROM users LIMIT 5');
    console.log('\n📊 Sample users:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runAdminMigration();
}

module.exports = { runAdminMigration }; 