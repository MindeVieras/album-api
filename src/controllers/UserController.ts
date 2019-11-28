import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import httpStatus from 'http-status-codes'
import jwt from 'jsonwebtoken'

import { User, UserRoles } from '../models'
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
   * Get list of users.
   */
  public async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find({}, { hash: 0 })
      return new ApiResponse(res, users)
    } catch (err) {
      next(err)
    }
  }
}
