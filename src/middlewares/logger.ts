
import { Request, Response, NextFunction } from 'express'

/**
 * Logger middleware.
 *
 * @param {Request} req
 *   Express request.
 * @param {Response} res
 *   Express response.
 * @param {NextFunction} res
 *   Express next().
 */
export function logger(req: Request, res: Response, next: NextFunction): void {
  console.log('Logger middleware works!')

  next()

}
