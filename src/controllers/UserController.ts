import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'
import passport from 'passport'
import { IVerifyOptions } from 'passport-local'

import { User, UserDocument } from '../models'
import { ApiResponse, ApiError } from '../helpers'
import { IRequestListQuery, IRequestAuthed } from '../typings'

/**
 * User controller class.
 */
export class UserController {
  /**
   * Get list of users.
   */
  public async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, page, sort } = req.query as IRequestListQuery
      const userPager = await User.paginate({}, { page, limit, sort })
      // Mutate pagination response to include user virtuals.
      const docs: UserDocument[] = userPager.docs.map((d) => d.toObject())
      // console.log(req)
      return new ApiResponse(res, { ...userPager, docs })
    } catch (err) {
      next(err)
    }
  }

  /**
   * Create new user.
   */
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body

      // Remove password from request as soon as possible.
      delete req.body.password

      // Create user data object, set password as hash.
      // Actual hash is generated at the model level.
      const userDataToSave = { ...req.body, hash: password }

      // Save user to database.
      const user = new User(userDataToSave)
      const savedUser = await user.save()

      return new ApiResponse(res, savedUser.toObject(), httpStatus.CREATED)
    } catch (err) {
      next(err)
    }
  }

  /**
   * Authenticates user.
   */
  public async authorize(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) {
        return next(err)
      }
      if (!user) {
        return next(new ApiError(info.message, httpStatus.UNAUTHORIZED))
      }
      req.logIn(user, async (err) => {
        if (err) {
          return next(err)
        }
        // Update last login date.
        await user.update({ lastLogin: new Date() })
        return new ApiResponse(res, user.toObject(), httpStatus.OK)
      })
    })(req, res, next)
  }

  /**
   * Logout user.
   */
  public logout(req: Request, res: Response) {
    req.logout()
    return new ApiResponse(res)
  }

  /**
   * Get single user.
   */
  public async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { _id } = req.params as { _id: string }
      const user = await User.findOne({ _id }, { hash: 0 })
      return new ApiResponse(res, user)
    } catch (err) {
      next(err)
    }
  }

  /**
   * Update user.
   */
  public async updateOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { _id } = req.params as { _id: string }
      const updatedUser = await User.updateOne({ _id }, req.body)
      return new ApiResponse(res, updatedUser)
    } catch (err) {
      next(err)
    }
  }

  /**
   * Delete user.
   */
  public async deleteOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { _id } = req.params as { _id: string }
      await User.deleteOne({ _id })
      return new ApiResponse(res)
    } catch (err) {
      next(err)
    }
  }
}
