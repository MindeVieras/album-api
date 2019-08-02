
import { NextFunction, Request, Response } from 'express'
import expressValidation from 'express-validation'
import httpStatus from 'http-status-codes'

import APIError from '../helpers/APIError'
import config from './config'

/**
 * Check for production.
 */
const isProd: boolean = (config.env === 'production')

/**
 * Error handler.
 * Send stacktrace only during development
 *
 * @param {*} err - Error object created by errorConverter().
 * @param {Request} req - Request.
 * @param {Response} res - Response.
 *
 * @returns {Promise}
 *  JSON user data including token.
 */
export const errorHandler = (err: any, req: Request, res: Response) => {
  // Set default status.
  const status: number = err.status || httpStatus.INTERNAL_SERVER_ERROR

  // Set default message by status code.
  let message = httpStatus.getStatusText(status)

  // Only developer can see custom messages.
  if (!isProd) {
    message = err.message || httpStatus.getStatusText(status)
  }

  const response = {
    status,
    message,
    errors: err.errors,
    stack: err.stack,
  }

  // Make sure we only expose stack property to developer only.
  if (isProd) {
    delete response.stack
  }

  return res.status(response.status).json(response)
}

/**
 * If error is not an instanceOf APIError, convert it.
 *
 * @param {*} err - The error thrown by express.
 * @param {Request} req - Request.
 * @param {Response} res - Response.
 * @param {NextFunction} next - Next handler.
 *
 * @returns {errorHandler} - Return errorHandler()
 */
export const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Set convertedError.
  let convertedError = err

  if (err instanceof expressValidation.ValidationError) {
    // Create default 'Bad request' error with a status of 400.
    const error = {
      status: httpStatus.BAD_REQUEST,
      message: httpStatus.getStatusText(httpStatus.BAD_REQUEST),
      errors: [],
      // errors: err.errors || [],
    }

    // Check if any headers errors.
    const headersErrors = error.errors.filter((e: { location: string }) => e.location === 'headers')

    // Set headers errors if any.
    if (headersErrors.length) {
      error.errors = headersErrors
      // Headers errors are exposed only for developer.
      if (isProd) {
        delete error.errors
      }
    } else {
      // Otherwise set the rest as validation error with status of 422
      // and filter out headers errors.
      error.status = httpStatus.UNPROCESSABLE_ENTITY
      error.message = 'Validation error'
      error.errors = error.errors.filter((e: { location: string }) => e.location !== 'headers')
    }

    convertedError = new APIError(error.message, error.status)

  } else if (!(err instanceof APIError)) {
    convertedError = new APIError(err.message, err.status, [], err.stack)
  }

  return errorHandler(convertedError, req, res)
}

/**
 * Catch 404 and forward to error handler
 *
 * @param {Request} req - Request.
 * @param {Response} res - Response.
 * @param {NextFunction} next - Next handler.
 *
 * @returns {errorHandler} - Return errorHandler()
 */
export const errorNotFound = (req: Request, res: Response, next: NextFunction) => {
  const err: APIError = new APIError('Not found', 400)
  return errorHandler(err, req, res)
}
