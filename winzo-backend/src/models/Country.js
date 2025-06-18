const { DataTypes, Model } = require('sequelize')
const sequelize = require('../../config/database')

/**
 * Country model represents nation data used by leagues, teams and venues.
 * Includes basic ISO code and flag URL for API-Sports integration.
 * @typedef {import('../types/models').CountryInstance} CountryInstance
 */
class Country extends Model {
  /**
   * Get country by ISO code
   * @param {string} code ISO 3166-1 alpha-2 code
   * @returns {Promise<Country>} country instance
   */
  static async findByCode (code) {
    return this.findOne({ where: { code } })
  }
}

Country.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true
    },
    flagUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'flag_url'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'updated_by'
    }
  },
  {
    sequelize,
    modelName: 'country',
    tableName: 'countries',
    paranoid: true,
    indexes: [{ fields: ['code'] }]
  }
)

module.exports = Country
