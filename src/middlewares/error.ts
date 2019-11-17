
import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'

import { ApiError } from '../helpers'
import { config } from '../config'

/**
 * API error middleware response interface.
 */
interface ErrorResponseProps {
  code: number,
  message: string,
  errors?: any[],
  stack?: string,
}

/**
 * Error handler.
 *
 * Send stacktrace only during development.
 *
 * @public
 */
export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {

  // Set ApiError response object.
  const response: ErrorResponseProps = {
    code: err.status,
    message: err.message,
    errors: err.errors,
  }

  // Only keep stack property on dev environment.
  if (config.env === 'development') {
    response.stack = err.stack
  }

  res.status(err.status).json(response)

}

/**
 * If error is not an instanceOf ApiError, convert it.
 *
 * @public
 */
export const errorConverter = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  let convertedError = err

  // Handle Mongoose validation errors.
  if (err.name === 'ValidationError') {
    convertedError = new ApiError(
      'Validation error',
      httpStatus.UNPROCESSABLE_ENTITY,
      err.errors,
    )
  }

  return errorHandler(convertedError, req, res, next)

}

/**
 * Catch 404 and forward to error handler.
 *
 * @public
 */
export const errorNotFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new ApiError(
    httpStatus.getStatusText(httpStatus.NOT_FOUND),
    httpStatus.NOT_FOUND,
  )

  return errorHandler(err, req, res, next)

}
