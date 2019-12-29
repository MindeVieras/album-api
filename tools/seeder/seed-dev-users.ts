import mongoose from 'mongoose'

import { databaseSetup } from '../../src/config'
import SeedDevUsers from './SeedDevUsers'
import { databaseClear } from './databaseClear'

/**
 * Development users seeder run function.
 */
async function runDevUsersSeeder() {
  // Setup database before seeding.
  await databaseSetup()

  // Clear database before seeding.
  await databaseClear()

  // Run dev users seed.
  await SeedDevUsers()

  // Disconnect from database after seed.
  await mongoose.disconnect()
}

runDevUsersSeeder()
