import 'reflect-metadata'
import { createExpressServer, useContainer } from 'routing-controllers'
import { Container } from 'typedi'
import chalk from 'chalk'

import { config, databaseSetup, passportStartup } from './config'

/**
 * Clear the console on a fresh start.
 */
console.clear()

/**
 * Use dependancy injection container.
 */
useContainer(Container)

/**
 * Application initialization.
 */
async function initialize() {
  // Make sure to connect to MongoDB bofore server runs.
  await databaseSetup()

  // Setup express server.
  const app = createExpressServer({
    routePrefix: '/api',
    middlewares: [],
    controllers: [__dirname + '/controllers/*{.js,.ts}'],
  })

  // Start passport middleware.
  await passportStartup(app)

  app.listen(config.port, () => {
    // Log about success server start only for dev environment.
    if (config.env === 'development') {
      console.log(`Server is running at: http://${config.host}:${config.port}\n`)
      // Log all awailable routes to console.
      console.log(
        app._router.stack
          .filter((r: any) => r.route)
          .map((r: any) => {
            const methods = Object.keys(r.route.methods)
            return chalk.green(`[${methods.join(',')}] ${r.route.path}`)
          })
          .join('\n'),
      )
    }
  })
}

initialize()
