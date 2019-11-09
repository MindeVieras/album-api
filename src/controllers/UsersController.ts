
import { Request, Response, NextFunction } from 'express'

import { controller, get, post, use } from './decorators'

/**
 * Logger function.
 *
 * @param {Request} req
 *   Express request.
 * @param {Response} res
 *   Express response.
 * @param {NextFunction} res
 *   Express next().
 */
function logger(req: Request, res: Response, next: NextFunction): void {
  console.log('Logger middleware works!')
  next()
}

/**
 * Users controller.
 */
@controller('/api')
class UsersController {

  /**
   * List users.
   *
   * @param {Request} req
   *   Express request.
   * @param {Response} res
   *   Express response.
   */
  @get('/users')
  @use(logger)
  public getUsers(req: Request, res: Response): void {
    res.send('Users route.')
  }

  /**
   * Create user.
   *
   * @param {Request} req
   *   Express request.
   * @param {Response} res
   *   Express response.
   */
  @post('/users')
  @use(logger)
  public createUser(req: Request, res: Response): void {
    res.send('User created')
  }
}
