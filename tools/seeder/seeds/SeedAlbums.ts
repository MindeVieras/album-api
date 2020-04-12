import chalk from 'chalk'
import faker from 'faker'
import ProgressBar from 'progress'

import { Album, AlbumDocument, Media, User } from '../../../src/models'
import { UserRoles, AlbumStatus } from '../../../src/enums'
import { getRandomFieldIndex } from '.'
import { SeederDefaults } from '../seederEnums'

/**
 * Seed albums.
 *
 * @param {number} count
 *   How many fake albums to seed?
 *
 * @returns {Promise<AlbumDocument[]>}
 *   Promise with an array of album documents.
 */
export async function SeedAlbums(count: number = SeederDefaults.total) {
  /**
   * Build list of fake albums and
   * randomize not required fields.
   */
  const albums: AlbumDocument[] = []
  for (let i = 1; i <= count; i++) {
    const album = new Album({
      name: faker.lorem.sentence(Math.floor(Math.random() * 4) + 1).slice(0, -1),
      status: faker.random.arrayElement(Object.values(AlbumStatus)),
      createdAt: faker.date.past(5),
      updatedAt: faker.date.past(),
      createdBy: SeederDefaults.fakeId,
    })
    albums.push(album)
  }

  // Randomize fake body field.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    albums[Math.floor(Math.random() * count)].body = faker.lorem.sentences(
      Math.floor(Math.random() * 10),
    )
  }

  // Initialize errors array.
  let errors: string[] = []

  // Set progress par.
  console.log(chalk.green('Generating fake albums: '))
  const bar = new ProgressBar(chalk.cyan(':current/:total :bar'), {
    total: count,
  })

  // Albums can only be created by admins and editors.
  const users = await User.find({ role: [UserRoles.admin, UserRoles.editor] })
  // Lod all the media.
  let media = await Media.find()

  // Loop through randomly generated albums array.
  for (let a of albums) {
    try {
      // Save fake album.
      const savedAlbum = await a.save()

      // Get random user.
      const random = Math.floor(Math.random() * users.length)
      const randomUser = users[random]
      if (randomUser) {
        // Set createdBy random user with matching role.
        await savedAlbum.update({ createdBy: randomUser.id })
      }

      // Random number of media items for this album.
      const totalMediaItems = Math.floor(Math.random() * 75)
      const shuffledMedia = media.sort(() => 0.5 - Math.random())

      const mediaIds = shuffledMedia.slice(0, totalMediaItems).map((m) => m.get('_id'))
      if (mediaIds) {
        // Set randomly shuffled media.
        await savedAlbum.update({ media: mediaIds })
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
  console.log(chalk.green(`${albums.length} fake albums generated\n`))

  return albums
}
