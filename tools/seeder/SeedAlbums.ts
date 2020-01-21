import chalk from 'chalk'
import faker from 'faker'
import ProgressBar from 'progress'

import { User, Album, AlbumDocument } from '../../src/models'
import { UserRoles, AlbumStatus } from '../../src/enums'
import { getRandomFieldIndex, SeedDefaults } from './Seed'

/**
 * Seed albums.
 *
 * @param {number} count
 *   How many fake albums to seed?
 *
 * @returns {Promise<AlbumDocument[]>}
 *   Promise with an array of album documents.
 */
export default async function SeedAlbums(count: number = SeedDefaults.count) {
  /**
   * Build list of fake albums and
   * randomize not required fields.
   */
  const albums: AlbumDocument[] = []
  for (let i = 1; i <= count; i++) {
    const album = {
      name: faker.lorem.sentence(Math.floor(Math.random() * 4) + 1).slice(0, -1),
      status: faker.random.arrayElement(Object.values(AlbumStatus)),
      createdAt: faker.date.past(5),
      updatedAt: faker.date.past(),
    } as AlbumDocument
    albums.push(album)
  }

  // Randomize fake body field.
  for (let step = 0; step < getRandomFieldIndex(count); step++) {
    albums[Math.floor(Math.random() * count)].body = faker.lorem.sentences(
      Math.floor(Math.random() * 10),
    )
  }

  /**
   * Save fake albums.
   */
  console.log(chalk.green('Generating fake albums: '))
  const bar = new ProgressBar(chalk.cyan(':percent :bar'), {
    total: count,
  })

  for (let a of albums) {
    try {
      const countQuery = { role: [UserRoles.admin, UserRoles.editor] }
      const count = await User.countDocuments(countQuery)
      const random = Math.floor(Math.random() * count)
      const randomUser = await User.findOne(countQuery).skip(random)
      a.createdBy = randomUser?.get('id')

      await new Album(a).save()
      bar.tick()
    } catch (error) {
      console.log(chalk.red(`\n${error.message}`))
      return albums
    }
  }

  // Summarize seed output.
  console.log(chalk.green(`${albums.length} fake albums generated\n`))

  return albums
}
