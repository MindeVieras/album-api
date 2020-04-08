import chalk from 'chalk'
import faker from 'faker'
import ProgressBar from 'progress'

import { User, IUserObject } from '../../../src/models/UserModel'
import { UserRoles, UserStatus } from '../../../src/enums'
import { SeederDefaults } from '../seederEnums'

/**
 * Seed users for development.
 *
 * @param {string} password
 *   Optional password to pass.
 *
 * @returns {Promise<IUserObject[]>}
 *   Admin user document.
 */
export async function SeedDevUsers(password: string = SeederDefaults.password) {
  /**
   * Build dev users array.
   */
  const users: IUserObject[] = Object.keys(UserRoles).map((role) => {
    return {
      username: role,
      hash: password,
      role,
      status: UserStatus.active,
      createdBy: SeederDefaults.fakeId,
      profile: {
        email: faker.internet.email(),
        displayName: `${role.replace(/^\w/, (c) => c.toUpperCase())} user`,
        locale: 'en',
      },
    }
  })
  // for (const role in UserRoles) {
  //   const user: IUserObject = {
  //     username: role,
  //     hash: password,
  //     role: UserRoles.admin,
  //     status: UserStatus.active,
  //     createdBy: SeederDefaults.fakeId,
  //     profile: {
  //       email: faker.internet.email(),
  //       displayName: `${role.replace(/^\w/, (c) => c.toUpperCase())} user`,
  //       locale: 'en',
  //     },
  //   }
  //   users.push(user)
  // }

  // Set progress par.
  console.log(chalk.green('Generating fake dev users: '))
  const bar = new ProgressBar(chalk.cyan(':current/:total :bar'), {
    total: users.length,
  })

  // Initialize errors array.
  let errors: string[] = []

  for (const u of users) {
    try {
      // Save fake dev users.
      await new User(u).save()
    } catch (error) {
      // Collect all error messages.
      errors.push(error.message)
    }

    // Tick progress bar.
    bar.tick()
  }

  // Log errors if any.
  for (const e of errors) {
    console.log(chalk.red(e))
  }

  // Summarize seed output.
  console.log(chalk.green(`${users.length} dev users generated.\n`))

  return users
}
