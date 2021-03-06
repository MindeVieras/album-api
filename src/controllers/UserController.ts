import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'
import passport from 'passport'
import { IVerifyOptions } from 'passport-local'
import jwt from 'jsonwebtoken'

import { Config, UserRoles, User, UserDocument, IUserObject } from 'album-sdk'

import { ApiResponse, ApiError, ApiErrorForbidden, ApiErrorNotFound } from '../helpers'

/**
 * User controller class.
 */
export class UserController {
  /**
   * Authenticates user.
   */
  public static authorize(req: Request, res: Response, next: NextFunction) {
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
  public static async getList(req: Request, res: Response, next: NextFunction) {
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
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, body } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }

      // If role is provided,
      // make sure that only admin users
      // can create other admins.
      if (body.role && body.role === UserRoles.admin && authedUser.role !== UserRoles.admin) {
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
  public static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, params } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      const { id } = params
      const user = await new User().getOne(authedUser, id)
      // Throw 404 error if no user.
      if (!user) {
        throw new ApiErrorNotFound()
      }
      return new ApiResponse(res, user.toObject())
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Update user.
   */
  public static async updateOne(req: Request, res: Response, next: NextFunction) {
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
  public static async delete(req: Request, res: Response, next: NextFunction) {


    // /**
    //  * Deletes users by ids.
    //  *
    //  * @param {IUserObject} authedUser
    //  *   Authenticated user request.
    //  * @param {string[]} ids
    //  *   Array of user ids.
    //  *
    //  * @returns {Promise<void>}
    //  *   Empty promise.
    //  */
    // userSchema.methods.delete = async function (authedUser: IUserObject, ids: string[]) {
    //   const idsFilter = { _id: { $in: ids } }
    //   // Authenticated user must be active to delete users.
    //   if (authedUser.status === UserStatus.active) {
    //     switch (authedUser.role) {
    //       // Admins can delete any users.
    //       case UserRoles.admin:
    //         return await User.deleteMany({ ...idsFilter })

    //       // Editors can only delete they own users.
    //       case UserRoles.editor:
    //         return User.deleteMany({ ...idsFilter, createdBy: authedUser.id })

    //       // Others cannot delete any users.
    //       default:
    //         return Promise
    //     }
    //   }

    //   return Promise
    // }



    try {
      const { authedUser, body } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      new User().deletePermanently(body)
      return new ApiResponse(res)
    } catch (err) {
      return next(err)
    }
  }
}
