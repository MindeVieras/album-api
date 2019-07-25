
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

    let status = err.status
    let message = httpStatus.getStatusText(httpStatus.BAD_REQUEST)
    let errors = err.errors

    // Check if any header errors.
    let headersErrors = []
    for (let i = 0; i < errors.length; i++) {
      if (errors[i].location == 'headers') {
        headersErrors.push(errors[i])
      }
    }

    if (headersErrors.length) {
      errors = headersErrors
    }
    else {
      status = httpStatus.UNPROCESSABLE_ENTITY
      message = 'Validation error'
      errors = errors.filter((e) => e.location != 'headers')
    }

    convertedError = new APIError({status, message, errors})
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
