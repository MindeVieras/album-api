import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'
import jwt from 'jsonwebtoken'

import { config } from '../config'
import { UserRoles } from '../enums'
import { ApiError } from './ApiError'
import { IRequestAuthed } from '../typings'

/**
 * Decoded token object structure.
 */
interface IDecodedToken {
  _id: string
  username: string
  role: UserRoles
}

/**
 * Check if user is admin.
 *
 * @param {IRequestAuthed} req
 *   Authenticated request.
 * @param {Response} res
 *   Express response.
 * @param {NextFunction} next
 *   Express next function.
 */
export function isAdmin(req: IRequestAuthed, res: Response, next: NextFunction): void {
  doAuth(req, res, next, UserRoles.admin)
}

/**
 * Check if user is authenticated.
 *
 * @param {IRequestAuthed} req
 *   Authenticated request.
 * @param {Response} res
 *   Express response.
 * @param {NextFunction} next
 *   Express next function.
 */
export function isAuthed(req: IRequestAuthed, res: Response, next: NextFunction): void {
  doAuth(req, res, next, UserRoles.authed)
}

/**
 * Check if user is viewer.
 *
 * @param {IRequestAuthed} req
 *   Authenticated request.
 * @param {Response} res
 *   Express response.
 * @param {NextFunction} next
 *   Express next function.
 */
export function isViewer(req: IRequestAuthed, res: Response, next: NextFunction): void {
  doAuth(req, res, next, UserRoles.viewer)
}

/**
 * Authentication function.
 *
 * @param {IRequestAuthed} req
 *   Authenticated request.
 * @param {Response} res
 *   Express response.
 * @param {NextFunction} next
 *   Express next function.
 * @param userRole
 *   User role, one of the UserRoles.
 *
 */
async function doAuth(req: IRequestAuthed, res: Response, next: NextFunction, userRole: UserRoles) {
  try {
    // Get 'authorization' header from request.
    const { authorization } = req.headers

    if (authorization) {
      const bearer = authorization.split(' ')
      const bearerToken = bearer[1]

      jwt.verify(bearerToken, config.jwtSecret, (err, decoded) => {
        if (err) {
          next(new ApiError(err.message, httpStatus.UNAUTHORIZED))
        } else {
          const { _id, username, role } = decoded as IDecodedToken
          // Admin
          if (role === UserRoles.admin) {
            req.userId = _id
            req.userRole = role
            next()
          }
          // Authed
          else if (role === UserRoles.authed && userRole === UserRoles.authed) {
            req.userId = _id
            req.userRole = role
            next()
          }
          // Viewer
          else if (role === UserRoles.viewer && userRole === UserRoles.viewer) {
            req.userId = _id
            req.userRole = role
            next()
          } else {
            next(new ApiError(httpStatus.getStatusText(httpStatus.FORBIDDEN), httpStatus.FORBIDDEN))
          }
        }
      })
    } else {
      // Pass ApiError to next if authorization header could not be found.
      next(new ApiError(httpStatus.getStatusText(httpStatus.FORBIDDEN), httpStatus.UNAUTHORIZED))
    }
  } catch (err) {
    // Catch all authentication errors.
    throw new ApiError(err.message, httpStatus.UNAUTHORIZED)
  }
}
