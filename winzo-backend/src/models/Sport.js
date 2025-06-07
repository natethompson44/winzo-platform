const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Sport model represents different sports available for betting on WINZO.
 * Each sport has a unique key from The Odds API and contains metadata
 * about the sport including its current active status.
 */
class Sport extends Model {}

Sport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Sport key from The Odds API (e.g., americanfootball_nfl)',
    },
    group: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Sport group category (e.g., American Football)',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Display title for the sport (e.g., NFL)',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Brief description of the sport',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this sport is currently in season and available for betting',
    },
    hasOutrights: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this sport supports outright/futures betting',
    },
  },
  {
    sequelize,
    modelName: 'sport',
    tableName: 'sports',
  }
);

module.exports = Sport;

