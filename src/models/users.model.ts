
/**
 * User Interface.
 */
export interface UserAttributes {
  id?: string
  username?: string
  hash?: string
  email?: string
  displayName?: string
  author?: number
  accessLevel?: number
  status?: number
  lastLogin?: Date
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Users Schema.
 *
 * @param {any} sequelize - Sequelize instance.
 * @param {any} DataTypes - Sequelize data types.
 *
 * @returns {object} Users model.
 */
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    hash: DataTypes.STRING,
    email: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    displayName: DataTypes.STRING(55),
    author: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    accessLevel: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: 25,
    },
    status: {
      type: DataTypes.TINYINT(1).UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    lastLogin: DataTypes.DATE,
  })

  return Users
}
