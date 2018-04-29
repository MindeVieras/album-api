
import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'

const app = express()

// Require variables from .env file if available
require('dotenv').config()

// Set server port, host
app.set('port',  process.env.APP_PORT || 3000)
app.set('host',  process.env.APP_HOST || 'localhost')

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

export default app
