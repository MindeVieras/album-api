import Server from './Server'
import { databaseSetup } from './config'

/**
 * Application initialization.
 */
async function app() {
  // Make sure to connect to MongoDB before server runs.
  await databaseSetup()

  // Run express server.
  new Server().listen()
}

app()
