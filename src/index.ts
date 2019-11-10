
import mongoose from 'mongoose'

import Server from './Server'
import { config } from './config'

mongoose
  .connect(config.mongodb, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))

// Run express server.
new Server().listen()
