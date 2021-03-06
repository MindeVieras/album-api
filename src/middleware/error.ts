import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'
import { unflatten } from 'flat'

import { Config } from 'album-sdk'

import { ApiError, IValidationErrors, ApiErrorNotFound } from '../helpers'

/**
 * API error middleware response interface.
 */
interface IErrorResponse {
  readonly status: 'CLIENT_ERROR' | 'SERVER_ERROR'
  readonly message: string
  readonly errors?: IValidationErrors
  readonly code?: number | string
  stack?: string
}

/**
 * Error handler.
 *
 * Send stacktrace only during development.
 */
export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  // Set response status, fallback to 500.
  const status = err.status || httpStatus.INTERNAL_SERVER_ERROR

  // Set ApiError response object.
  const response: IErrorResponse = {
    status: status < httpStatus.INTERNAL_SERVER_ERROR ? 'CLIENT_ERROR' : 'SERVER_ERROR',
    code: err.code,
    message: err.message,
    errors: err.errors,
  }

  // Only keep stack property on dev environment.
  if (Config.env === 'development') {
    response.stack = err.stack
  }

  // Return error response in JSON.
  res.status(status).json(response)
}

/**
 * If error is not an instanceOf ApiError, convert it.
 */
export const errorConverter = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  let convertedError = err

  // Handle Joi input validation errors.
  if (err.error && err.error.isJoi) {
    let errors = {} as IValidationErrors
    for (const detail of err.error.details) {
      // Make error path.
      const path = detail.path.join('.')
      // Unflatten Joi errors.
      errors = unflatten({
        ...errors,
        [path]: detail.message,
      })
    }

    convertedError = new ApiError('Input validation error', httpStatus.UNPROCESSABLE_ENTITY, errors)
  }

  /**
   * Handle errors from the models.
   */

  // // Media Key already exists error.
  // if (err.name === 'MediaKeyAlreadyExistsError') {
  //   convertedError = new ApiError(err.message, httpStatus.CONFLICT)
  // }
  // // User already exists error.
  // if (err.name === 'UserAlreadyExistsError') {
  //   convertedError = new ApiError(err.message, httpStatus.CONFLICT)
  // }
  // // User not found error.
  // if (err.name === 'UserNotFoundError') {
  //   convertedError = new ApiErrorNotFound()
  // }

  return errorHandler(convertedError, req, res, next)
}

/**
 * Catch 404 and forward to error handler.
 */
export const errorNotFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new ApiErrorNotFound()

  return errorHandler(err, req, res, next)
}
