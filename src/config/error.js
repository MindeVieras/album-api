
import httpStatus from 'http-status-codes'
import expressValidation from 'express-validation'

import APIError from '../helpers/APIError'
import config from '../config/config'

const isDev = (config.env == 'development')

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
export const errorHandler = (err, req, res, next) => {

  let message = httpStatus.getStatusText(err.status)

  if (isDev)
    message = err.message

  const response = {
    code: err.status,
    message,
    errors: err.errors,
    stack: err.stack
  }

  if (!isDev)
    delete response.stack

  res.status(err.status)
  res.json(response)
}

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
export const errorConverter = (err, req, res, next) => {

  let convertedError = err

  if (err instanceof expressValidation.ValidationError)
    convertedError = new APIError({
      message: 'Validation error',
      errors: err.errors,
      status: err.status,
      stack: err.stack
    })

  else if (!(err instanceof APIError))
    convertedError = new APIError({
      message: err.message,
      status: err.status,
      stack: err.stack
    })

  return errorHandler(convertedError, req, res)
}

/**
 * Catch 404 and forward to error handler
 * @public
 */
export const errorNotFound = (req, res, next) => {
  const err = new APIError({
    message: 'Not found',
    status: httpStatus.NOT_FOUND
  })
  return errorHandler(err, req, res)
}
