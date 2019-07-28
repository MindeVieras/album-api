
import bcrypt from 'bcrypt'

const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    email: 'admin@test.com',
    displayName: 'Test Admin',
    author: 1,
    accessLevel: 100,
    status: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    username: 'editor',
    password: bcrypt.hashSync('editor123', 10),
    email: 'editor@test.com',
    author: 1,
    accessLevel: 75,
    status: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    username: 'authed',
    password: bcrypt.hashSync('authed123', 10),
    email: 'authed@test.com',
    author: 2,
    accessLevel: 50,
    status: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    username: 'viewer',
    password: bcrypt.hashSync('viewer123', 10),
    email: 'viewer@test.com',
    author: 2,
    accessLevel: 25,
    status: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    username: 'blocked',
    password: bcrypt.hashSync('blocked123', 10),
    email: 'blocked@test.com',
    author: 1,
    accessLevel: 50,
    status: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', users, {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
