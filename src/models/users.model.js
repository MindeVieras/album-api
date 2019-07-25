
/**
 * Users Schema
 */
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    password: DataTypes.STRING,
    email: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true
    },
    displayName: DataTypes.STRING(55),
    author: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    accessLevel: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: 25
    },
    status: {
      type: DataTypes.TINYINT(1).UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    lastLogin: DataTypes.DATE
  })

  return Users
}
