import { Database } from 'album-api-config'

import Server from './Server'

/**
 * Application initialization.
 */
async function app() {
  // Make sure to connect to MongoDB before server runs.
  const db = new Database()
  await db.setup()

  // Run express server.
  new Server().listen()
}

app()
