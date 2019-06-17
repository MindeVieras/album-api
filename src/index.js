
import config from './config/config'
import app from './config/express'
import { errorConverter, errorNotFound, errorHandler } from './config/error'
import routes from './routes/index.route'

// API routes
app.use('/api', routes)

// if error is not an instanceOf APIError, convert it.
app.use(errorConverter)
// catch 404 and forward to error handler
app.use(errorNotFound)
// error handler, send stacktrace only during development
app.use(errorHandler)

// Start HTTP server
app.listen(config.port, () => {
  console.log(`Server running at http://${config.host}:${config.port}`)
})

export default app
