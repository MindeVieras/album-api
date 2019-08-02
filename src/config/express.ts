
import bodyParser from 'body-parser'
import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import path from 'path'
// import swaggerUi from 'swagger-ui-express'

import config from './config'

// import swaggerDocument from '../swagger.json'

/**
 * Set express app.
 */
const app: Application = express()

// Disable useless header.
app.disable('x-powered-by')

// CORS.
app.use(cors())

// Body parser.
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb',
}))
app.use(bodyParser.json({
  limit: '50mb',
}))

// Home route.
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Album API!')
})

if (config.env === 'development') {
  // Colony - modules dependancy visualization route.
  app.use('/colony', express.static(path.join(__dirname, '../../colony')))
}

// Swagger UI route.
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

export default app
