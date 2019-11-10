
import { Request, Response } from 'express'

import { controller, get, post, use, validate } from './decorators'
import { validationSchema } from '../config/validationSchema'
import { logger } from '../middlewares'
import { ApiError } from '../helpers/ApiError'
import { User } from '../models/User'

/**
 * Users controller.
 */
@controller('')
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
    User.find().then((u) => {
      res.send(u)
    })
    // throw new ApiError('This is thrown error.')
    // res.send('Users route.')

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
