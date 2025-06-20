const { DataTypes } = require('sequelize')
module.exports = (sequelize) => {
  const Bookmaker = sequelize.define('Bookmaker', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Unique identifier from The Odds API'
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Display name of the bookmaker'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this bookmaker is currently active'
    },
    region: {
      type: DataTypes.STRING(10),
      defaultValue: 'us',
      comment: 'Geographic region (us, uk, au, eu)'
    }
  }, {
    tableName: 'bookmakers',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['key']
      },
      {
        fields: ['active']
      },
      {
        fields: ['region']
      }
    ]
  })
  return Bookmaker
}
