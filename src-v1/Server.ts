
import bodyParser from 'body-parser'
import cors from 'cors'
import express, { Application } from 'express'
import morgan from 'morgan'
import path from 'path'

import { config } from './config'
import routes from './routes/index.route'

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

    // Middleware only for dev environment.
    if (config.env === 'development') {
      // Logger
      this.app.use(morgan('dev'))
    }

    // Home route
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, './index.html'))
    })
    // API routes.
    this.app.use('/api', routes)
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
