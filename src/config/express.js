
import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'

import config from './config'

const swaggerDocument = require('../swagger.json')

const app = express()

// Disable useless header.
app.disable('x-powered-by')

// Logger
if (config.env === 'development') {
  app.use(morgan('dev'))
}

// CORS
app.use(cors())

// Body parser
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb',
}))
app.use(bodyParser.json({
  limit: '50mb',
}))

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'))
})

if (config.env === 'development') {
  // Colony - modules dependancy visualization route
  app.use('/colony', express.static(path.join(__dirname, '../../colony')))
}
// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

export default app
