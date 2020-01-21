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
    const randomEmailCount = Math.floor(Math.random() * count)
    users[randomEmailCount].profile = {
      ...users[randomEmailCount].profile,
      email: faker.internet.email(),
    }
  }
  // Randomize fake displayName fields.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    const randomDisplayNameCount = Math.floor(Math.random() * count)
    users[randomDisplayNameCount].profile = {
      ...users[randomDisplayNameCount].profile,
      displayName: faker.name.findName(),
    }
  }
  // Randomize fake locale fields.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    const randomLocaleCount = Math.floor(Math.random() * count)
    users[randomLocaleCount].profile = {
      ...users[randomLocaleCount].profile,
      locale: faker.random.locale(),
    }
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

  for (let u of users) {
    try {
      let countQuery = {}
      switch (u.role) {
        case UserRoles.viewer:
          countQuery = { role: [UserRoles.admin, UserRoles.editor] }
          break

        case UserRoles.editor:
          countQuery = { role: UserRoles.admin }
          break

        case UserRoles.admin:
          countQuery = { role: UserRoles.admin }
          break
      }

      const count = await User.countDocuments(countQuery)
      const random = Math.floor(Math.random() * count)
      const randomUser = await User.findOne(countQuery).skip(random)
      u.createdBy = randomUser?.get('id')

      await new User(u).save()
      bar.tick()
    } catch (error) {
      console.log(chalk.red(`\n${error.message}`))
      return users
    }
  }

  // Summarize seed output.
  console.log(
    chalk.green(`${users.length} fake users generated with password: ${chalk.cyan(password)}\n`),
  )

  return users
}
