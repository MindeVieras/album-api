import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'
import { unflatten } from 'flat'

import { ApiError, IValidationErrors, ApiErrorNotFound } from '../helpers'
import { config } from '../config'

/**
 * API error middleware response interface.
 */
interface IErrorResponse {
  status: 'CLIENT_ERROR' | 'SERVER_ERROR'
  message: string
  errors?: IValidationErrors
  code?: number | string
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
  if (config.env === 'development') {
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
      console.log(detail)
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

  return errorHandler(convertedError, req, res, next)
}

/**
 * Catch 404 and forward to error handler.
 */
export const errorNotFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new ApiErrorNotFound()

  return errorHandler(err, req, res, next)
}
