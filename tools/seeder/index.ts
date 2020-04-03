import { prompt } from 'inquirer'
import mongoose from 'mongoose'

import { databaseSetup } from '../../src/config'

import {
  collectionQuestion,
  collectionDropQuestion,
  usersQuestion,
  totalQuestion,
  userPassQuestion,
} from './seederQuestions'

import { SeedUsers, SeedDevUsers } from './seeds'

// Clear console on seeder start.
console.clear()

/**
 * Seeder run function.
 */
async function runSeeder() {
  try {
    /**
     * Setup database before seeding.
     */
    await databaseSetup()

    /**
     * Ask which model to seed.
     */
    const { collection } = await prompt([collectionQuestion])

    /**
     * Ask if collection should be dropped before seeding.
     */
    const { drop } = await prompt([collectionDropQuestion])
    if (drop) {
      // Drop collection selected in previous question.
      await mongoose.connection.db.dropCollection(collection)
    }

    /**
     * Proceed to the next step after choosing a collection.
     */
    switch (collection) {
      case 'Users':
        // Ask what users to seed - 'dev' or 'random'.
        const { type } = await prompt(usersQuestion)

        if (type === 'dev') {
          /**
           * Seed dev users.
           */
          const { password } = await prompt([userPassQuestion])

          console.clear()
          await SeedDevUsers(password)
        } else {
          /**
           * Seed random users.
           */
          const { total } = await prompt([totalQuestion])
          const { password } = await prompt([userPassQuestion])

          console.clear()
          await SeedUsers(total, password)
        }

        break

      case 'Albums':
        /**
         * Seed random albums.
         */
        const { total } = await prompt([totalQuestion])
        console.log(total)
        // await SeedAlbums(total)
        break
    }

    // Disconnect from database after seed.
    await mongoose.disconnect()
  } catch (e) {
    console.error(e)
  }

  // Exit after seeding is done.
  process.exit()
}

runSeeder()

// import mongoose from 'mongoose'

// import { Seed } from './Seed'
// import { databaseClear } from './databaseClear'
