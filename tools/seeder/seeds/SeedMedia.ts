import chalk from 'chalk'
import faker from 'faker'
import ProgressBar from 'progress'

import { Media, MediaDocument, User } from '../../../src/models'
import { UserRoles, MediaStatus } from '../../../src/enums'
import { SeederDefaults } from '../seederEnums'

const imageSizes = [
  {
    width: 1024,
    height: 768,
  },
  {
    width: 2240,
    height: 1680,
  },
  {
    width: 3264,
    height: 2448,
  },
]

/**
 * Seed media.
 *
 * @param {number} count
 *   How many fake media items to seed?
 *
 * @returns {Promise<MediaDocument[]>}
 *   Promise with an array of media documents.
 */
export async function SeedMedia(count: number = SeederDefaults.total) {
  /**
   * Build list of fake media and
   * randomize not required fields.
   */
  const media: MediaDocument[] = []
  for (let i = 1; i <= count; i++) {
    const imageSize = faker.random.arrayElement(imageSizes)
    const med = new Media({
      key: faker.random.image(),
      name: 'image.jpg',
      size: faker.random.number({ min: 2020, max: 20200412 }),
      mime: 'image/jpeg',
      status: faker.random.arrayElement(Object.values(MediaStatus)),
      createdBy: SeederDefaults.fakeId,
      width: imageSize.width,
      height: imageSize.height,
      createdAt: faker.date.past(5),
      updatedAt: faker.date.past(),
    })
    media.push(med)
  }

  // Initialize errors array.
  let errors: string[] = []

  // Set progress par.
  console.log(chalk.green('Generating fake media: '))
  const bar = new ProgressBar(chalk.cyan(':current/:total :bar'), {
    total: count,
  })

  // Media can only be created by admins and editors.
  const users = await User.find({ role: [UserRoles.admin, UserRoles.editor] })

  // Loop through randomly generated media array.
  for (let m of media) {
    try {
      // Save fake media.
      const savedMedia = await m.save()

      // Get random user.
      const randomUserNumber = Math.floor(Math.random() * users.length)
      const randomUser = users[randomUserNumber]
      if (randomUser) {
        // Set createdBy random user with matching role.
        await savedMedia.update({ createdBy: randomUser.id })
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
  console.log(chalk.green(`${media.length} fake media items generated\n`))

  return media
}
