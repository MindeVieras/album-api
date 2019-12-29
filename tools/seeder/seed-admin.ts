import mongoose from 'mongoose'

import { databaseSetup } from '../../src/config'
import SeedAdmin from './SeedAdmin'

/**
 * Admin user seeder run function.
 */
async function runAdminSeeder() {
  // Setup database before seeding.
  await databaseSetup()

  // Run admin seed.
  await SeedAdmin()

  // Disconnect from database after seed.
  await mongoose.disconnect()
}

runAdminSeeder()
