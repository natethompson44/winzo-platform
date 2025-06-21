const { Sequelize } = require('sequelize')
const fs = require('fs')
const path = require('path')

// Create database connection only if not provided
function createSequelizeConnection() {
  return new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log, // Enable logging to see what's happening
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production'
        ? {
            require: true,
            rejectUnauthorized: false
          }
        : false
    }
  })
}

async function checkIfTablesExist(sequelize) {
  try {
    const result = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    return result[0].length > 0
  } catch (error) {
    return false
  }
}

async function checkIfColumnExists(sequelize, tableName, columnName) {
  try {
    const result = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${tableName}' AND column_name = '${columnName}'
    `)
    return result[0].length > 0
  } catch (error) {
    return false
  }
}

async function runMigrationScript(sequelize, filename, description) {
  try {
    console.log(`\n🔄 Running ${description}...`)
    const migrationPath = path.join(__dirname, filename)
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    await sequelize.query(migrationSQL)
    console.log(`✅ ${description} completed successfully`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    throw error
  }
}

async function runCompleteMigration(externalSequelize = null) {
  let sequelize = externalSequelize
  let shouldCloseConnection = false
  
  if (!sequelize) {
    sequelize = createSequelizeConnection()
    shouldCloseConnection = true
  }

  try {
    console.log('\n🚀 Starting comprehensive database migration...')

    // Test connection
    await sequelize.authenticate()
    console.log('✅ Database connection established')

    // Check if basic tables exist
    const tablesExist = await checkIfTablesExist(sequelize)
    
    if (!tablesExist) {
      console.log('\n📊 No tables found, running initial schema creation...')
      await runMigrationScript(sequelize, 'schema.sql', 'Basic schema creation')
    } else {
      console.log('\n📊 Basic tables already exist')
    }

    // Check if user enhancement columns exist
    const firstNameExists = await checkIfColumnExists(sequelize, 'users', 'first_name')
    
    if (!firstNameExists) {
      console.log('\n👤 Running user enhancement migration...')
      await runMigrationScript(sequelize, 'user_enhancement_migration.sql', 'User enhancement migration')
    } else {
      console.log('\n👤 User enhancement columns already exist')
    }

    // Check if role column exists
    const roleExists = await checkIfColumnExists(sequelize, 'users', 'role')
    
    if (!roleExists) {
      console.log('\n🔐 Running admin role migration...')
      await runMigrationScript(sequelize, 'admin_role_migration.sql', 'Admin role migration')
    } else {
      console.log('\n🔐 Admin role column already exists')
    }

    console.log('\n🎉 Complete migration finished successfully!')
    return true
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message)
    throw error
  } finally {
    if (shouldCloseConnection) {
      await sequelize.close()
    }
  }
}

// Run if called directly
if (require.main === module) {
  runCompleteMigration()
    .then(() => {
      console.log('\n✅ Migration process completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Migration process failed:', error)
      process.exit(1)
    })
}

module.exports = { runCompleteMigration } 