
import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'

// Require variables from .env file.
require('dotenv').config()

const app = express()

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
  limit: '50mb'
}))

export default app
