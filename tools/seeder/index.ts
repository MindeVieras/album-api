import mongoose from 'mongoose'

import { Seed } from './Seed'
import { databaseSetup } from '../../src/config'
import { databaseClear } from './databaseClear'

/**
 * Seeder run function.
 */
async function runSeeder() {
  // Setup database before seeding.
  await databaseSetup()

  // Clear database before seeding.
  await databaseClear()

  // Run seed.
  await Seed()

  // Disconnect from database after seed.
  await mongoose.disconnect()
}

runSeeder()
