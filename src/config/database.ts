import chalk from 'chalk'
import mongoose from 'mongoose'

import { Config } from 'album-api-config'

/**
 * Setup MongoDB connection.
 */
export async function databaseSetup() {
  try {
    await mongoose.connect(Config.mongodb, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
  } catch (err) {
    console.log(chalk.red('MongoDB error:'), err.message)
    process.exit()
  }
}
