
import path from 'path'
import express, { Application, Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'

import { config } from './config'
import { ApiRouter } from './ApiRouter'
import { errorConverter, errorNotFound, errorHandler } from './middlewares'

// Import all controllers.
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

    // Home route
    this.app.get('/', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, './index.html'))
    })

    // All ApiRoutes and ApiError handling middleware,
    // goes under /api path.
    this.app.use('/api',

      // Initiate ApiRouter instance singleton.
      ApiRouter.getInstance(),

      // If error is not an instanceOf APIError, convert it.
      errorConverter,
      // Catch 404 and forward to error handler.
      errorNotFound,
      // Error handler, send stacktrace only during development.
      errorHandler,
    )

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
