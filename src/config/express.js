
import express from 'express'
import ev from 'express-validation'
import httpStatus from 'http-status-codes'
import path from 'path'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'

const swaggerDocument = require('../swagger.json')

const app = express()

// Set express-validation settings for the requests body/params.
ev.options({
  status: httpStatus.UNPROCESSABLE_ENTITY,
  statusText: httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR)
})

// Logger
app.use(morgan('dev'))

// CORS
app.use(cors())

// Body parser
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}))
app.use(bodyParser.json({
  limit : '50mb'
}))

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'))
})
// Colony - modules dependancy visualization route
app.use('/colony', express.static(path.join(__dirname, '../../colony')))
// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

export default app
