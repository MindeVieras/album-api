
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
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    displayName: DataTypes.STRING(55),
    author: DataTypes.INTEGER.UNSIGNED,
    accessLevel: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: 25
    },
    status: {
      type: DataTypes.TINYINT(1).UNSIGNED,
      allowNull: false
    },
    lastLogin: DataTypes.DATE
  })

  return Users
}
