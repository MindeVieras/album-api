
import jwt from 'jsonwebtoken'
import httpStatus from 'http-status-codes'

import APIError from './APIError'
import Const from '../constants'
import config from '../config/config'

/**
 * Check if user is admin.
 *
 * @param {*} req - Request.
 * @param {*} res - Response.
 * @param {*} next - Send to error handler.
 * @param {number} al - Access level number.
 *
 * @returns {Promise}
 *  Goes to the next middleware if authenticated,
 *  otherwise will throw next APIError.
 */
function doAuth(req, res, next, al) {
  // Get authorization header value.
  const bearerHeader = req.headers.authorization

  if (typeof bearerHeader !== 'undefined') {
    // Get token from header value.
    const bearer = bearerHeader.split(' ')
    const bearerToken = bearer[1]

    jwt.verify(bearerToken, config.jwtSecret, (err, decoded) => {
      // Return APIError is token is not verified.
      if (err) {
        const error = new APIError({
          message: httpStatus.getStatusText(httpStatus.UNAUTHORIZED),
          status: httpStatus.UNAUTHORIZED,
        })
        return next(error)
      }

      const { id, accessLevel } = decoded
      // Admin.
      if (accessLevel === Const.USER_ACCESS_ADMIN) {
        req.app.set('user', { uid: id, accessLevel })
        return next()
      }
      // Authed.
      if (accessLevel === Const.USER_ACCESS_AUTHED
        && al === Const.USER_ACCESS_AUTHED) {
        req.app.set('user', { uid: id, accessLevel })
        return next()
      }
      // Viewer.
      if (accessLevel === Const.USER_ACCESS_VIEWER
        && al === Const.USER_ACCESS_VIEWER) {
        req.app.set('user', { uid: id, accessLevel })
        return next()
      }

      const error = new APIError({
        message: httpStatus.getStatusText(httpStatus.FORBIDDEN),
        status: httpStatus.FORBIDDEN,
      })
      return next(error)
    })
  }
  else {
    const error = new APIError({
      message: httpStatus.getStatusText(httpStatus.UNAUTHORIZED),
      status: httpStatus.UNAUTHORIZED,
    })
    return next(error)
  }

  return true
}

/**
 * Check if user is admin.
 *
 * @param {*} req - Request.
 * @param {*} res - Response.
 * @param {*} next - Send to error handler.
 */
export function isAdmin(req, res, next) {
  doAuth(req, res, next, Const.USER_ACCESS_ADMIN)
}

/**
 * Check if user is authenticated.
 *
 * @param {*} req - Request.
 * @param {*} res - Response.
 * @param {*} next - Send to error handler.
 */
export function isAuthed(req, res, next) {
  doAuth(req, res, next, Const.USER_ACCESS_AUTHED)
}

/**
 * Check if user is viewer.
 *
 * @param {*} req - Request.
 * @param {*} res - Response.
 * @param {*} next - Send to error handler.
 */
export function isViewer(req, res, next) {
  doAuth(req, res, next, Const.USER_ACCESS_VIEWER)
}
