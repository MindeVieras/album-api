
import { Request, Response, NextFunction } from 'express'

import { User } from '../models'

/**
 * Users controller class.
 */
export class UsersController {

  /**
   * create new user.
   */
  public async create(req: Request, res: Response, next: NextFunction) {
    try {

      const user = new User(req.body)
      const savedUser = await user.save()
      res.send(savedUser)

    } catch (err) {
      next(err)
    }
  }

  /**
   * Get list of users.
   */
  public async getList(req: Request, res: Response) {
    try {

      const users = await User.find()
      console.log(users)
      res.send(users)

    } catch (err) {
      console.log(err)
    }
  }
}
