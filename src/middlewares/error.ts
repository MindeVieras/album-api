
import { Request, Response, NextFunction } from 'express'
// import HttpStatus from 'http-status-codes'
// import expressValidation from 'express-validation'

// import { ApiError } from '../helpers'
// import { config } from '../config'

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // const response = {
  //   code: err.status,
  //   message: err.message || HttpStatus[err.status],
  //   errors: err.errors,
  //   stack: err.stack
  // }

  // if (config.env !== 'development') {
  //   delete response.stack
  // }

  // res.status(err.status)
  // res.json(response)
  res.send(err.message)
}

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
export const errorConverter = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // let convertedError = err

  // // if (err instanceof expressValidation.ValidationError) {
  // //   convertedError = new APIError({
  // //     message: 'Validation error',
  // //     errors: err.errors,
  // //     status: err.status,
  // //     stack: err.stack
  // //   })
  // // }
  // else if (!(err instanceof APIError)) {
  //   convertedError = new APIError({
  //     message: err.message,
  //     status: err.status,
  //     stack: err.stack
  //   })
  // }

  // return errorHandler(convertedError, req, res)
  return errorHandler(err, req, res, next)
}

/**
 * Catch 404 and forward to error handler
 * @public
 */
export const errorNotFound = (req: Request, res: Response, next: NextFunction) => {
  // const err = new ApiError({
  //   message: 'Not found',
  //   status: HttpStatus.NOT_FOUND
  // })
  const err = new Error('This is 404 error.')
  return errorHandler(err, req, res, next)
}
