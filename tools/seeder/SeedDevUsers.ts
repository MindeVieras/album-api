import chalk from 'chalk'
import faker from 'faker'
import ProgressBar from 'progress'

import { User, UserDocument } from '../../src/models/UserModel'
import { UserRoles, UserStatus } from '../../src/enums'
import { SeedDefaults } from './Seed'

/**
 * Seed users for development.
 *
 * @returns {Promise<UserDocument[]>}
 *   Admin user document.
 */
export default async function SeedDevUsers() {
  /**
   * Build dev users array.
   */
  const users: UserDocument[] = []
  for (const role in UserRoles) {
    const user = {
      username: role,
      hash: SeedDefaults.password,
      role,
      status: UserStatus.active,
      profile: {
        email: faker.internet.email(),
        displayName: `${role.replace(/^\w/, (c) => c.toUpperCase())} user`,
        locale: 'en',
      },
    } as UserDocument
    users.push(user)
  }

  /**
   * Save dev users.
   */
  console.log(chalk.green('Generating dev users: '))
  const bar = new ProgressBar(chalk.cyan(':percent :bar'), {
    total: users.length,
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

  // Summarize seed output.
  console.log(chalk.green(`${users.length} dev users generated.\n`))

  return users
}
