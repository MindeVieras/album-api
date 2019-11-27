import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'

import { ApiError } from '../helpers'
import { config } from '../config'
import { MongoError } from 'mongodb'

/**
 * API error middleware response interface.
 */
interface IErrorResponse {
  message: string
  errors?: any[]
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

  // Handle param validation errors.
  if (err.error && err.error.isJoi) {
    convertedError = new ApiError('Input validation error', httpStatus.UNPROCESSABLE_ENTITY, err.error.details)
  }
  // Handle Mongoose schema validation errors.
  else if (err.name === 'ValidationError') {
    convertedError = new ApiError('Schema validation error', httpStatus.UNPROCESSABLE_ENTITY, err.errors)
  }
  // Handle MongoError.
  else if (err instanceof MongoError) {
    // Mongo error code for dublicate entry.
    if (err.code === 11000) {
      convertedError = new ApiError('Document already exists', httpStatus.CONFLICT, err.errors)
    }
  }

  return errorHandler(convertedError, req, res, next)
}

/**
 * Catch 404 and forward to error handler.
 */
export const errorNotFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new ApiError(httpStatus.getStatusText(httpStatus.NOT_FOUND), httpStatus.NOT_FOUND)

  return errorHandler(err, req, res, next)
}
