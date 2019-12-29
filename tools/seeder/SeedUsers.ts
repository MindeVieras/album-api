import chalk from 'chalk'
import faker from 'faker'
import ProgressBar from 'progress'

import { User, UserDocument } from '../../src/models/UserModel'
import { UserRoles, UserStatus } from '../../src/enums'
import { getRandomFieldIndex, SeedDefaults } from './Seed'

/**
 * Seed users.
 *
 * @param {number} count
 *   How many fake users to seed?
 * @param {string} password
 *   Password for all seeded users.
 *
 * @returns {Promise<UserDocument[]>}
 *   Promise with an array of user instances.
 */
export default async function SeedUsers(
  count: number = SeedDefaults.count,
  password: string = SeedDefaults.password,
) {
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
  console.log(chalk.green('Generating fake users: '))
  const bar = new ProgressBar(chalk.cyan(':percent :bar'), {
    total: count,
  })

  for (const u of users) {
    try {
      await new User(u).save()
      bar.tick()
    } catch (error) {
      console.log(chalk.red(`\n${error.message}`))
      return users
    }
  }

  console.log(
    chalk.green(`${users.length} fake users generated with password: ${chalk.cyan(password)}\n`),
  )

  return users
}
