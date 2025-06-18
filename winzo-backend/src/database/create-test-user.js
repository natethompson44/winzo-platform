const { Sequelize } = require('sequelize')
const bcrypt = require('bcryptjs')

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

async function createTestUser () {
  try {
    console.log('\n🔧 Creating test user...')

    // Test connection
    await sequelize.authenticate()
    console.log('\n✅ Database connection established')

    // Check if testuser2 already exists
    const existingUser = await sequelize.query(`
      SELECT id, username, email, wallet_balance 
      FROM users 
      WHERE username = 'testuser2';
    `)

    if (existingUser[0].length > 0) {
      console.log('\n⚠️ User testuser2 already exists:')
      existingUser[0].forEach(user => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email || 'N/A'}, Balance: $${user.wallet_balance || 0}`)
      })

      // Update the password for existing user
      const hashedPassword = await bcrypt.hash('testuser2', 10)
      await sequelize.query(`
        UPDATE users 
        SET password_hash = $1, wallet_balance = 1000.00 
        WHERE username = 'testuser2';
      `, {
        bind: [hashedPassword]
      })
      console.log('\n✅ Updated password for existing testuser2')
    } else {
      // Create new test user
      const hashedPassword = await bcrypt.hash('testuser2', 10)
      const result = await sequelize.query(`
        INSERT INTO users (username, email, password_hash, wallet_balance, is_active) 
        VALUES ('testuser2', 'test@winzo.com', $1, 1000.00, true)
        RETURNING id, username, email, wallet_balance;
      `, {
        bind: [hashedPassword]
      })

      console.log('\n✅ Created new test user:')
      result[0].forEach(user => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email || 'N/A'}, Balance: $${user.wallet_balance || 0}`)
      })
    }

    console.log('\n🎉 Test user ready!')
    console.log('Username: testuser2')
    console.log('Password: testuser2')
  } catch (error) {
    console.error('\n❌ Error creating test user:', error.message)
  } finally {
    await sequelize.close()
  }
}

// Run if called directly
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('\n🎉 Test user creation completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Test user creation failed:', error)
      process.exit(1)
    })
}

module.exports = { createTestUser }
