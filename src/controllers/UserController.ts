import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'
import passport from 'passport'
import { IVerifyOptions } from 'passport-local'
import jwt from 'jsonwebtoken'

import { config } from '../config'
import { User, UserDocument } from '../models'
import { ApiResponse, ApiError } from '../helpers'
import { IRequestListQuery } from '../typings'
import { UserRoles } from '../enums'

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

      const currentUser = req.user as UserDocument

      // Only admin users can list all users.
      // Others can only list they own users.
      let query = {}
      if (currentUser.role !== UserRoles.admin) {
        query = { createdBy: currentUser.id }
      }

      const userPager = await User.paginate(query, { page, limit, sort })
      // Mutate pagination response to include user virtual props.
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
      const { password, role } = req.body as { password: string; role?: UserRoles }

      // Remove password from request as soon as possible.
      delete req.body.password

      const currentUser = req.user as UserDocument

      // If role is provided,
      // make sure that only admin users
      // can create other admins.
      if (role && role === UserRoles.admin && currentUser.role !== UserRoles.admin) {
        throw new ApiError(httpStatus.getStatusText(httpStatus.FORBIDDEN), httpStatus.FORBIDDEN)
      }

      // Create user data object, set password as hash.
      // Actual hash is generated at the model level.
      const userDataToSave = { ...req.body, hash: password, createdBy: currentUser.id }

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

        // Sign for JWT token.
        const token = jwt.sign(user.toObject(), config.jwtSecret)

        return new ApiResponse(res, { ...user.toObject(), token }, httpStatus.OK)
      })
    })(req, res, next)
  }

  /**
   * Get single user.
   */
  public async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const currentUser = req.user as UserDocument

      // Admin can access anu user,
      // authed users can only access they own users
      // and viewers can only access own user.
      let query = {}
      if (currentUser.role === UserRoles.viewer) {
        query = { _id: currentUser.id }
      } else if (currentUser.role === UserRoles.authed) {
        query = { _id: id, createdBy: currentUser.id }
      } else {
        query = { _id: id }
      }

      const user = await User.findOne(query)

      // Return empty next() if user not found, which means error 404.
      if (!user) {
        return next()
      }

      return new ApiResponse(res, user.toObject())
    } catch (err) {
      next(err)
    }
  }

  /**
   * Update user.
   */
  public async updateOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const currentUser = req.user as UserDocument

      const user = await User.findById(id)

      // Return empty next() if user not found, which means error 404.
      if (!user) {
        return next()
      }

      // Handle username field,
      // it can only by updated bu admin user.
      if (req.body.username && currentUser.role === UserRoles.admin) {
        user.username = req.body.username
      }

      // Handle profile fields.
      if (req.body.profile) {
        user.profile = { ...user.toObject().profile, ...req.body.profile }
      }

      await user.save()

      return new ApiResponse(res, user.toObject())
    } catch (err) {
      next(err)
    }
  }

  /**
   * Delete user by id.
   */
  public async deleteOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const currentUser = req.user as UserDocument

      // Only admin can delete any user,
      // others can only delete they own users.
      if (currentUser.role === UserRoles.admin) {
        await User.findByIdAndDelete(id)
      } else {
        await User.findOneAndDelete({ _id: id, createdBy: currentUser.id })
      }

      return new ApiResponse(res)
    } catch (err) {
      next(err)
    }
  }
}
