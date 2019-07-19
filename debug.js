
'use strict'

const faker = require('faker')

const totalFakeUsers = 10

let fakeUsers = []

// Loop through totalFakeUsers counter.
for (let step = 1; step < totalFakeUsers + 1; step++) {
  // Required user fields.
  const user = {
    // username: faker.internet.userName(),
    // email: faker.internet.email(),
    author: 1,
    // createdAt: faker.date.past(5),
    // updatedAt: new Date()
  }
  fakeUsers.push(user)
}

// Randomize fake displayName fields.
for (let step = 0; step < getRandomIndex(totalFakeUsers); step++) {
  fakeUsers[Math.floor(Math.random() * totalFakeUsers)].displayName = faker.name.findName()
}

console.log(fakeUsers)

function getRandomIndex(total) {
  // Has to be 1 or more.
  return Math.floor(Math.random() * (total - 1)) + 1
}
