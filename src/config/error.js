
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

  if (err instanceof expressValidation.ValidationError) {

    // Create default 'Bad request' error with a status of 400.
    let error = {
      status: httpStatus.BAD_REQUEST,
      message: httpStatus.getStatusText(httpStatus.BAD_REQUEST),
      errors: err.errors || []
    }

    // Check if any headers errors.
    let headersErrors = error.errors.filter((e) => e.location == 'headers')

    // Set headers errors if any.
    if (headersErrors.length) {
      error.errors = headersErrors
      // Headers errors are exposed only for developer.
      if (!isDev) delete error.errors
    }
    // Otherwise set the rest as validation error with status of 422
    // and filter out headers errors.
    else {
      error.status = httpStatus.UNPROCESSABLE_ENTITY
      error.message = 'Validation error'
      erorr.errors = errors.filter((e) => e.location != 'headers')
    }

    convertedError = new APIError(error)
  }
  else if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err.status,
      stack: err.stack
    })
  }

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
