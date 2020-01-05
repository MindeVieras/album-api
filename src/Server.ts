import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import express, { Application, Request, Response } from 'express'
import morgan from 'morgan'
import path from 'path'
import passport from 'passport'

import { config } from './config'
import routes from './routes/index.route'
import { errorConverter, errorNotFound, errorHandler } from './middleware'

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

  /**
   * Server base url.
   */
  public static baseUrl = `http://${config.host}:${config.port}`

  constructor() {
    // Add some extra security to the API.
    this.app.use(helmet())

    // Compresses requests.
    this.app.use(compression())

    // CORS.
    this.app.use(cors())

    // Body parser.
    this.app.use(bodyParser.urlencoded({ extended: true })).use(bodyParser.json())

    // Middleware only for dev environment.
    if (config.env === 'development') {
      // Dev logger.
      this.app.use(morgan('dev'))
    }

    // Initialize passport middleware.
    this.app.use(passport.initialize())

    // Home route.
    this.app.get('/', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, './index.html'))
    })

    // All ApiRoutes and ApiError handling middleware,
    // goes under /api path.
    this.app.use(
      '/api',
      // Add routes middleware.
      routes,
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
        console.log(`Server running at ${Server.baseUrl}`)
      }
    })
  }
}
