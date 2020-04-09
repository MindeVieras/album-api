import chalk from 'chalk'
import faker from 'faker'
import ProgressBar from 'progress'

import { User, UserDocument } from '../../../src/models'
import { UserRoles, UserStatus } from '../../../src/enums'
import { getRandomFieldIndex } from '.'
import { SeederDefaults } from '../seederEnums'

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
export async function SeedUsers(
  count: number = SeederDefaults.total,
  password: string = SeederDefaults.password,
) {
  /**
   * Build list of fake users and
   * randomize not required fields.
   */
  const users: UserDocument[] = []
  for (let i = 1; i <= count; i++) {
    const user = new User({
      username: faker.internet.userName(),
      hash: password,
      role: faker.random.arrayElement(Object.values(UserRoles)),
      status: faker.random.arrayElement(Object.values(UserStatus)),
      createdAt: faker.date.past(5),
      updatedAt: faker.date.past(),
      createdBy: SeederDefaults.fakeId,
    })
    users.push(user)
  }

  // Randomize fake email field.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    const randomEmailCount = Math.floor(Math.random() * count)
    users[randomEmailCount].profile = {
      ...users[randomEmailCount].profile,
      email: faker.internet.email(),
    }
  }
  // Randomize fake displayName field.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    const randomDisplayNameCount = Math.floor(Math.random() * count)
    users[randomDisplayNameCount].profile = {
      ...users[randomDisplayNameCount].profile,
      displayName: faker.name.findName(),
    }
  }
  // Randomize fake locale field.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    const randomLocaleCount = Math.floor(Math.random() * count)
    users[randomLocaleCount].profile = {
      ...users[randomLocaleCount].profile,
      locale: faker.random.locale(),
    }
  }
  // Randomize fake lastLogin field.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    users[Math.floor(Math.random() * count)].lastLogin = faker.date.past(2)
  }

  // Set progress par.
  console.log(chalk.green('Generating fake users: '))
  const bar = new ProgressBar(chalk.cyan(':current/:total :bar'), {
    total: count,
  })

  // Initialize errors array.
  let errors: string[] = []

  // Loop through randomly generated users array.
  for (let u of users) {
    try {
      // Save fake user.
      const savedUser = await u.save()

      // Count users by role.
      let countQuery = {}
      switch (savedUser.role) {
        case UserRoles.viewer:
          // Viewers can be created by admins and editors.
          countQuery = { role: [UserRoles.admin, UserRoles.editor] }
          break

        case UserRoles.editor:
          // Editors can only be created by admins.
          countQuery = { role: UserRoles.admin }
          break

        case UserRoles.admin:
          // Admins can only be created by admins.
          countQuery = { role: UserRoles.admin }
          break
      }

      // Count all currently available users by the role.
      const count = await User.countDocuments(countQuery)

      // Get random user from the random count query.
      const random = Math.floor(Math.random() * count)
      const randomUser = await User.findOne(countQuery).skip(random)

      if (randomUser) {
        // Set createdBy random user with matching role.
        await savedUser.update({ createdBy: randomUser.id })
      }
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
  console.log(
    chalk.green(`${users.length} fake users generated with password: ${chalk.cyan(password)}\n`),
  )

  return users
}
