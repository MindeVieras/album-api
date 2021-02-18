import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'
import passport from 'passport'
import { IVerifyOptions } from 'passport-local'
import jwt from 'jsonwebtoken'

import Config from 'album-api-config'

import { User, UserDocument, IUserObject } from '../models'
import { ApiResponse, ApiError, ApiErrorForbidden } from '../helpers'

/**
 * User controller class.
 */
export class UserController {
  /**
   * Authenticates user.
   */
  public authorize(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) {
        return next(err)
      }
      if (!user) {
        return next(new ApiError(info.message, httpStatus.UNAUTHORIZED))
      }
      req.login(user, { session: false }, async (err) => {
        if (err) {
          return next(err)
        }
        // Set last login date.
        user.setLastLogin()

        const userObject = user.toObject() as IUserObject

        // Sign for JWT token.
        const token = jwt.sign(userObject, Config.jwtSecret)

        return new ApiResponse(res, { ...userObject, token }, httpStatus.OK)
      })
    })(req, res, next)
  }

  /**
   * Get list of users.
   */
  public async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, query } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      const users = await new User().getList(authedUser, query)
      const { docs, ...usersCopy } = users
      const objects = docs.map((d) => d.toObject()) as IUserObject[]
      return new ApiResponse(res, { docs: objects, ...usersCopy })
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Create new user.
   */
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, body } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      const savedUser = await new User().create(authedUser, body)
      return new ApiResponse(res, savedUser.toObject(), httpStatus.CREATED)
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Get single user.
   */
  public async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, params } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      const { id } = params
      const user = await new User().getOne(authedUser, id)
      return new ApiResponse(res, user.toObject())
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Update user.
   */
  public async updateOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, params, body } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      const { id } = params
      const user = await new User().updateOne(authedUser, id, body)
      return new ApiResponse(res, user.toObject())
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Delete users by ids.
   */
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, body } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      new User().delete(authedUser, body)
      return new ApiResponse(res)
    } catch (err) {
      return next(err)
    }
  }
}
