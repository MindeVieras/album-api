import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import httpStatus from 'http-status-codes'
import jwt from 'jsonwebtoken'

import { User } from '../models'
import { UserRoles } from '../enums'
import { ApiResponse, ApiError } from '../helpers'
import { config } from '../config'

/**
 * Interface for data to encode to token.
 */
interface ITokenData {
  username: string
  role: UserRoles
}

/**
 * User controller class.
 */
export class UserController {
  /**
   * Authenticates user.
   */
  public async authorize(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body

      const user = await User.findOne({ username })

      // Check if user exists.
      if (!user) {
        throw new ApiError('Incorrect details', httpStatus.UNAUTHORIZED)
      }

      // Compare password.
      const passwordMatch = await bcrypt.compare(password, user.hash)

      if (!passwordMatch) {
        throw new ApiError('Incorrect details', httpStatus.UNAUTHORIZED)
      }

      // Update last login date.
      await user.update({ lastLogin: new Date() })

      // Sign for JWT token.
      const tokenData: ITokenData = {
        username,
        role: user.role,
      }
      const token = jwt.sign(tokenData, config.jwtSecret)

      return new ApiResponse(res, { ...tokenData, token }, httpStatus.OK)
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

      return new ApiResponse(res, savedUser, httpStatus.CREATED)
    } catch (err) {
      next(err)
    }
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
   * Get list of users.
   */
  public async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, page, sort } = req.query as { limit: number; page: number; sort: string }
      const users = await User.paginate({}, { page, limit, sort, select: { hash: 0 } })
      return new ApiResponse(res, users)
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
