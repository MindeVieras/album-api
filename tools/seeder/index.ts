import mongoose from 'mongoose'

import Seed from './Seed'
import { databaseSetup } from '../../src/config'

/**
 * Seeder run function.
 */
async function runSeeder() {
  // Setup database before seeding.
  await databaseSetup()

  // Run seed.
  await Seed()

  // Disconnect from database after seed.
  await mongoose.disconnect()
}

runSeeder()
