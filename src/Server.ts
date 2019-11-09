
import express, { Application } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'

import { config } from './config'
import { AppRouter } from './AppRouter'

// Import all controllers.
import './controllers/RootController'
import './controllers/UsersController'

/**
 * Server class.
 *
 * @class
 */
export default class Server {

  /**
   * Setup express app.
   */
  public app: Application = express()

  constructor() {

    // Disable useless header.
    this.app.disable('x-powered-by')

    // CORS.
    this.app.use(cors())

    // Body parser.
    this.app.use(bodyParser.urlencoded({ extended: true }))
      .use(bodyParser.json())

    // Middleware only for dev environment.
    if (config.env === 'development') {
      // Dev logger
      this.app.use(morgan('dev'))
    }

    this.app.use(AppRouter.getInstance())

  }

  /**
   * Start HTTP server.
   */
  public listen(): void {
    this.app.listen(config.port, () => {
      // Log about success server start only for dev environment.
      if (config.env === 'development') {
        console.log(`Server running at http://${config.host}:${config.port}`)
      }
    })
  }
}
