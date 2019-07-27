
import faker from 'faker'

const totalFakeUsers = 100

module.exports = {
  up: (queryInterface, Sequelize) => {

    let fakeUsers = []

    // Loop through totalFakeUsers counter.
    for (let step = 1; step < totalFakeUsers + 1; step++) {
      // Required user fields.
      const user = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        author: faker.random.number({ min: 1, max: totalFakeUsers }),
        createdAt: faker.date.past(5),
        updatedAt: faker.date.past()
      }

      // Optional fields.
      user.accessLevel = faker.random.arrayElement([25, 50, 100])
      user.status = faker.random.number({ min: 0, max: 1 })

      fakeUsers.push(user)
    }

    // Randomize fake password fields.
    for (let step = 0; step < getRandomFieldIndex(totalFakeUsers); step++) {
      fakeUsers[Math.floor(Math.random() * totalFakeUsers)].password = faker.internet.password()
    }
    // Randomize fake displayName fields.
    for (let step = 0; step < getRandomFieldIndex(totalFakeUsers); step++) {
      fakeUsers[Math.floor(Math.random() * totalFakeUsers)].displayName = faker.name.findName()
    }
    // Randomize fake lastLogin fields.
    for (let step = 0; step < getRandomFieldIndex(totalFakeUsers); step++) {
      fakeUsers[Math.floor(Math.random() * totalFakeUsers)].lastLogin = faker.date.past(2)
    }

    return queryInterface.bulkInsert('Users', fakeUsers, {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}

function getRandomFieldIndex(total) {
  // Give it a descent random number to populate half or more of total.
  return Math.floor(Math.random() * (total - 1)) + (total / 2)
}
