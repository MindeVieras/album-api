import faker from 'faker'
import ProgressBar from 'progress'

import { User, UserDocument } from '../../src/models/UserModel'
import { UserRoles, UserStatus } from '../../src/enums'
import { getRandomFieldIndex } from './seedUtils'

/**
 * Seed users.
 *
 * @param {number} count
 *   How many fake users to seed?
 * @param {string} password
 *   Password for all seeded users.
 */
export default async function seedUsers(count: number = 1000, password: string = 'Password123!') {
  /**
   * Build list of fake users.
   * Randomize not required fields.
   */
  const users: UserDocument[] = []
  for (let i = 1; i <= count; i++) {
    const user = {
      username: faker.internet.userName(),
      hash: password,
      role: faker.random.arrayElement(Object.values(UserRoles)),
      status: faker.random.arrayElement(Object.values(UserStatus)),
      createdAt: faker.date.past(5),
      updatedAt: faker.date.past(),
    } as UserDocument
    users.push(user)
  }

  // Randomize fake email fields.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    users[Math.floor(Math.random() * count)].email = faker.internet.email()
  }
  // Randomize fake displayName fields.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    users[Math.floor(Math.random() * count)].displayName = faker.name.findName()
  }
  // Randomize fake locale fields.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    users[Math.floor(Math.random() * count)].locale = faker.random.locale()
  }
  // Randomize fake lastLogin fields.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    users[Math.floor(Math.random() * count)].lastLogin = faker.date.past(2)
  }

  /**
   * Save fake users.
   */
  const bar = new ProgressBar(':percent:bar', { total: count })

  for (let i = 0; i < users.length; i++) {
    await new User(users[i]).save()
    bar.tick()
  }

  return users
}
