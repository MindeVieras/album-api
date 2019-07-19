
import bcrypt from 'bcrypt'

module.exports = {
  up: (queryInterface, Sequelize) => {

    // Check if user already exists.
    return queryInterface.bulkDelete('users', {
      username: process.env.ADMIN_USER
    })
      .then(() => {
        // Create password hash.
        return bcrypt.hash(process.env.ADMIN_PASS, 10)
      })
      .then(password => {
        // Make admin user object.
        const admin = {
          id: 1,
          username: process.env.ADMIN_USER,
          password,
          email: process.env.ADMIN_EMAIL,
          author: 1,
          accessLevel: 100,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Insert user to databse.
        return queryInterface.bulkInsert('users', [admin], {})
      })
      .catch(error => {
        console.error(error)
      })

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {})
  }
}
