
import chalk from 'chalk'
import mongoose from 'mongoose'

import Server from './Server'
import { config } from './config'

/**
 * Connect to MongoDB.
 */
(async () => {
  // Make sure to connect to MongoDB bofore server runs.
  try {
    await mongoose
      .connect(config.mongodb, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      })

    // Run express server.
    new Server().listen()

  } catch (err) {
    console.log(chalk.red(`MongoDB error: ${err.message}`))
    return
  }

})()
