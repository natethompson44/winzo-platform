const { Sequelize } = require('sequelize')

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? {
          require: true,
          rejectUnauthorized: false
        }
      : false
  }
})

async function checkTables () {
  try {
    console.log('\n🔍 Checking database tables and users...')

    // Test connection
    await sequelize.authenticate()
    console.log('\n✅ Database connection established')

    // Check what tables exist
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%user%'
      ORDER BY table_name;
    `)

    console.log('\n📊 Tables with "user" in the name:')
    tables[0].forEach(table => {
      console.log(`  - ${table.table_name}`)
    })

    // Check users in each table
    for (const table of tables[0]) {
      const tableName = table.table_name
      console.log(`\n👥 Users in ${tableName}:`)

      try {
        const users = await sequelize.query(`
          SELECT id, username, email, wallet_balance, created_at 
          FROM "${tableName}" 
          ORDER BY id;
        `)

        if (users[0].length === 0) {
          console.log('  (No users found)')
        } else {
          users[0].forEach(user => {
            console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email || 'N/A'}, Balance: $${user.wallet_balance || 0}`)
          })
        }
      } catch (error) {
        console.log(`  ❌ Error querying ${tableName}: ${error.message}`)
      }
    }

    // Check which table the auth system is using
    console.log('\n🔐 Checking auth configuration...')
    console.log('Current DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    console.log('Current NODE_ENV:', process.env.NODE_ENV || 'development')
  } catch (error) {
    console.error('\n❌ Error checking tables:', error.message)
  } finally {
    await sequelize.close()
  }
}

// Run if called directly
if (require.main === module) {
  checkTables()
    .then(() => {
      console.log('\n🎉 Table check completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Table check failed:', error)
      process.exit(1)
    })
}

module.exports = { checkTables }
