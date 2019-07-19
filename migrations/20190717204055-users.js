
'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      password: Sequelize.STRING,
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      displayName: Sequelize.STRING(55),
      author: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED
      },
      accessLevel: {
        type: Sequelize.INTEGER(3).UNSIGNED,
        allowNull: false,
        defaultValue: 25
      },
      status: {
        type: Sequelize.TINYINT(1).UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      lastLogin: Sequelize.DATE,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
