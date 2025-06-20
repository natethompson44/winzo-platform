const { DataTypes } = require('sequelize')
module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_cancelled'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Positive for credits, negative for debits'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Reference to bet ID or other related record'
    },
    balance_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'User balance after this transaction'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'winzo'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'completed'
    }
  }, {
    tableName: 'transactions',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['created_at'] },
      { fields: ['reference_id'] }
    ]
  })
  return Transaction
}
