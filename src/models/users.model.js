
/**
 * Users Schema
 */
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  })

  return Users
}
