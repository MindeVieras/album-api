import chalk from 'chalk'
import faker from 'faker'
import ProgressBar from 'progress'

import { Album, IAlbumObject } from '../../../src/models'
import { UserRoles, AlbumStatus } from '../../../src/enums'
import { getRandomFieldIndex } from '.'
import { SeederDefaults } from '../seederEnums'

/**
 * Seed albums.
 *
 * @param {number} count
 *   How many fake albums to seed?
 *
 * @returns {Promise<IAlbumObject[]>}
 *   Promise with an array of album documents.
 */
export async function SeedAlbums(count: number = SeederDefaults.total) {
  /**
   * Build list of fake albums and
   * randomize not required fields.
   */
  const albums: IAlbumObject[] = []
  for (let i = 1; i <= count; i++) {
    const album: IAlbumObject = {
      name: faker.lorem.sentence(Math.floor(Math.random() * 4) + 1).slice(0, -1),
      status: faker.random.arrayElement(Object.values(AlbumStatus)),
      createdAt: faker.date.past(5),
      updatedAt: faker.date.past(),
    }
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

  // Loop through randomly generated albums array.
  for (let a of albums) {
    try {
      const countQuery = { role: [UserRoles.admin, UserRoles.editor] }
      // const count = await User.countDocuments(countQuery)
      // const random = Math.floor(Math.random() * count)
      // const randomUser = await Album.findOne(countQuery).skip(random)
      // a.createdBy = randomUser?.get('id')
      a.createdBy = '5e8b7e5512cfadedf57ade35'

      await new Album(a).save()
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
