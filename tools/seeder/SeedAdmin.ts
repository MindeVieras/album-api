import chalk from 'chalk'
import faker from 'faker'

import { User, UserDocument } from '../../src/models/UserModel'
import { UserRoles, UserStatus } from '../../src/enums'
import { SeedDefaults } from './Seed'

/**
 * Seed users.
 *
 * @param {string} adminName
 *   The name for the admin.
 *
 * @returns {Promise<UserDocument>}
 *   Admin user document.
 */
export default async function SeedAdmin(adminName: string = SeedDefaults.adminName) {
  /**
   * Build admin user object for database.
   */
  const adminUser = {
    username: adminName,
    hash: faker.internet.password(),
    email: faker.internet.email(),
    displayName: 'Admin User',
    locale: 'en',
    role: UserRoles.admin,
    status: UserStatus.active,
  } as UserDocument

  /**
   * Save admin user.
   */
  try {
    console.log(chalk.green('Creating admin user:'))
    await new User(adminUser).save()
    console.log(chalk.cyan(`Username: ${adminUser.username} Password: ${adminUser.hash}\n`))
  } catch (error) {
    console.log(chalk.red(`${error.message}\n`))
  }

  return adminUser
}
