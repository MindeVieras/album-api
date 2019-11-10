
import { Request, Response } from 'express'

import { controller, get, post, use, validate } from './decorators'
import { validationSchema } from '../config/validationSchema'
import { logger } from '../middlewares'

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
  public getUsers(req: Request, res: Response) {

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
  @validate(validationSchema.body.userCreate)
  public createUser(req: Request, res: Response) {

    res.send('User created')

  }
}
