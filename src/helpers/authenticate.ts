import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'
import jwt from 'jsonwebtoken'

import { config } from '../config'
import { UserRoles } from '../models'
import { ApiError } from './ApiError'

/**
 * Decoded token object structure.
 */
interface IDecodedToken {
  _id: string
  username: string
  role: string
}

/**
 * Check if user is admin.
 *
 * @param {Request} req
 *   Express request.
 * @param {Response} res
 *   Express response.
 * @param {NextFunction} next
 *   Express next function.
 */
export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  doAuth(req, res, next, UserRoles.admin)
}

/**
 * Check if user is authenticated.
 *
 * @param {Request} req
 *   Express request.
 * @param {Response} res
 *   Express response.
 * @param {NextFunction} next
 *   Express next function.
 */
export function isAuthed(req: Request, res: Response, next: NextFunction): void {
  doAuth(req, res, next, UserRoles.authed)
}

/**
 * Check if user is viewer.
 *
 * @param {Request} req
 *   Express request.
 * @param {Response} res
 *   Express response.
 * @param {NextFunction} next
 *   Express next function.
 */
export function isViewer(req: Request, res: Response, next: NextFunction): void {
  doAuth(req, res, next, UserRoles.viewer)
}

/**
 * Authentication function.
 *
 * @param {Request} req
 *   Express request.
 * @param {Response} res
 *   Express response.
 * @param {NextFunction} next
 *   Express next function.
 * @param userRole
 *   User role, one of the UserRoles.
 *
 */
async function doAuth(req: Request, res: Response, next: NextFunction, userRole) {
  try {
    // Get 'authorization' header from request.
    const { authorization } = req.headers

    if (authorization) {
      const bearer = authorization.split(' ')
      const bearerToken = bearer[1]

      // const verifiedToken = await tokenVerify(bearerToken)
      // console.log(verifiedToken)
      // next()

      jwt.verify(bearerToken, config.jwtSecret, (err, decoded) => {
        if (err) {
          next(new ApiError(err.message, httpStatus.UNAUTHORIZED))
        } else {
          const { _id, username, role } = decoded as IDecodedToken
          console.log(role)
          // Admin
          if (role === UserRoles.admin) {
            // req.app.set('user', { uid: id, access_level })
            next()
          }
          // Authed
          else if (role === UserRoles.authed && userRole === UserRoles.authed) {
            // req.app.set('user', { uid: id, access_level })
            next()
          }
          // Viewer
          else if (role === UserRoles.viewer && userRole === UserRoles.viewer) {
            // req.app.set('user', { uid: id, access_level })
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

/**
 * Token verification function
 */
function tokenVerify(bearerToken: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(bearerToken, 'config.jwtSecret', (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}
