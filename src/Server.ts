
import bodyParser from 'body-parser'
import cors from 'cors'
import express, { Application } from 'express'
import path from 'path'
// import swaggerUi from 'swagger-ui-express'

import config from './config/config'
import { errorConverter, errorHandler, errorNotFound } from './config/error'
import routes from './routes/index.route'
// import swaggerDocument from '../swagger.json'

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
    this.app.use(bodyParser.urlencoded({
      extended: true,
      limit: '50mb',
    }))
    this.app.use(bodyParser.json({
      limit: '50mb',
    }))

    if (config.env === 'development') {
      // Colony - modules dependancy visualization route.
      this.app.use('/colony', express.static(path.join(__dirname, '../../colony')))

      // Swagger UI route.
      // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    }

    // API routes.
    this.app.use('/api', routes)

    // If error is not an instanceOf APIError, convert it.
    this.app.use(errorConverter)
    // Catch 404 and forward to error handler.
    this.app.use(errorNotFound)
    // Error handler, send stacktrace only during development.
    this.app.use(errorHandler)
  }

  /**
   * Start HTTP server.
   */
  public listen(): void {
    this.app.listen(config.port, () => {
      if (config.env === 'development') {
        console.log(`Server running at http://${config.host}:${config.port}`)
      }
    })
  }
}
