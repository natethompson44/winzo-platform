const sequelize = require('../../config/database');

async function init() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync();
  } catch (err) {
    console.error('Unable to connect to database:', err);
  }
}

module.exports = init;
