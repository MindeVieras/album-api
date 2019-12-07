import mongoose from 'mongoose'

import seed from './seed'
import { databaseSetup } from '../../src/config'

/**
 * Seeder run function.
 */
async function runSeeder() {
  // Setup database before seeding.
  await databaseSetup()

  // Run seed.
  await seed()

  // Disconnect from database after seed.
  await mongoose.disconnect()
}

runSeeder()
