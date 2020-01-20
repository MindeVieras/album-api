import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'
import passport from 'passport'
import { IVerifyOptions } from 'passport-local'
import jwt from 'jsonwebtoken'

import { config } from '../config'
import { User, UserDocument } from '../models'
import { ApiResponse, ApiError } from '../helpers'

/**
 * User controller class.
 */
export class UserController {
  /**
   * Get list of users.
   */
  public async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = req.user as UserDocument
      const users = await new User().getList(currentUser, req.query)
      return new ApiResponse(res, users)
    } catch (err) {
      next(err)
    }
  }

  /**
   * Create new user.
   */
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = req.user as UserDocument
      const savedUser = await new User().create(currentUser, req.body)
      return new ApiResponse(res, savedUser, httpStatus.CREATED)
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
      const user = await new User().getOne(currentUser, id)
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
      const { id } = req.params
      const currentUser = req.user as UserDocument
      const user = await new User().updateOne(currentUser, id, req.body)
      return new ApiResponse(res, user)
    } catch (err) {
      next(err)
    }
  }

  /**
   * Delete users by ids.
   */
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = req.user as UserDocument
      new User().delete(currentUser, req.body)
      return new ApiResponse(res)
    } catch (err) {
      next(err)
    }
  }
}
