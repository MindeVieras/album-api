import chalk from 'chalk'
import faker from 'faker'
import ProgressBar from 'progress'

import { Media, MediaDocument, Album, User } from '../../../src/models'
import { UserRoles, AlbumStatus, MediaStatus } from '../../../src/enums'
import { getRandomFieldIndex } from '.'
import { SeederDefaults } from '../seederEnums'

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
    const med = new Media({
      key: faker.random.image(),
      filename: 'image.jpg',
      size: 732412,
      mimeType: 'image/jpeg',
      status: faker.random.arrayElement(Object.values(MediaStatus)),
      createdBy: SeederDefaults.fakeId,
      albumId: SeederDefaults.fakeId,
      width: 1024,
      height: 800,
      createdAt: faker.date.past(5),
      updatedAt: faker.date.past(),
    })
    media.push(med)
  }

  // Randomize fake body field.
  // for (let step = 0; step < getRandomFieldIndex(count); step++) {
  //   albums[Math.floor(Math.random() * count)].body = faker.lorem.sentences(
  //     Math.floor(Math.random() * 10),
  //   )
  // }

  // Initialize errors array.
  let errors: string[] = []

  // Set progress par.
  console.log(chalk.green('Generating fake media: '))
  const bar = new ProgressBar(chalk.cyan(':current/:total :bar'), {
    total: count,
  })

  // Media and albums can only be created by admins and editors.
  const users = await User.find({ role: [UserRoles.admin, UserRoles.editor] })
  const albums = await Album.find({ role: [UserRoles.admin, UserRoles.editor] })

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

      // Get random album.
      const randomAlbumNumber = Math.floor(Math.random() * albums.length)
      const randomAlbum = albums[randomAlbumNumber]
      if (randomAlbum) {
        // Set albumId random album with matching role.
        await savedMedia.update({ albumId: randomAlbum.id })
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
