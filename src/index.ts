
import config from './config/config'
import app from './config/express'
import { errorConverter, errorNotFound, errorHandler } from './config/error'
// import routes from './routes/index.route'

// API routes.
// app.use('/api', routes)

// If error is not an instanceOf APIError, convert it.
app.use(errorConverter)
// Catch 404 and forward to error handler.
app.use(errorNotFound)
// Error handler, send stacktrace only during development.
app.use(errorHandler)

// Start HTTP server.
app.listen(config.port, () => {
  if (config.env === 'development') {
    console.log(`Server running at http://${config.host}:${config.port}`)
  }
})

export default app
