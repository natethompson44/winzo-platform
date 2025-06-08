const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const Country = require('./Country');

/**
 * Venue model stores information about stadiums or arenas where events are held.
 * Used for richer event data and WINZO celebratory messaging.
 * @typedef {import('../types/models').VenueInstance} VenueInstance
 */
class Venue extends Model {}

Venue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    api_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      unique: true,
      field: 'api_id'
    },
    country_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'countries', key: 'id' },
    },
    name: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    capacity: { type: DataTypes.INTEGER, allowNull: true },
    surface: { type: DataTypes.STRING, allowNull: true },
    image: { type: DataTypes.STRING, allowNull: true },
    createdBy: { type: DataTypes.UUID, allowNull: true, field: 'created_by' },
    updatedBy: { type: DataTypes.UUID, allowNull: true, field: 'updated_by' },
  },
  {
    sequelize,
    modelName: 'venue',
    tableName: 'venues',
    paranoid: true,
    indexes: [
      { fields: ['api_id'] },
      { fields: ['country_id'] },
    ],
  }
);

module.exports = Venue;
