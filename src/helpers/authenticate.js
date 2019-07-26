
import jwt from 'jsonwebtoken'
import httpStatus from 'http-status-codes'

import APIError from './APIError'
import { usersConstants } from '../constants'
import config from '../config/config'

// Check if user admin.
export function isAdmin(req, res, next) {
  doAuth(req, res, next, usersConstants.USER_ACCESS_ADMIN)
}
// Check if user authenticated.
export function isAuthed(req, res, next) {
  doAuth(req, res, next, usersConstants.USER_ACCESS_AUTHED)
}
// Check if user is viewer.
export function isViewer(req, res, next) {
  doAuth(req, res, next, usersConstants.USER_ACCESS_VIEWER)
}

function doAuth(req, res, next, al) {

  const bearerHeader = req.headers['authorization']

  if (typeof bearerHeader !== 'undefined') {

    const bearer = bearerHeader.split(' ')
    const bearerToken = bearer[1]

    jwt.verify(bearerToken, config.jwtSecret, (err, decoded) => {

      if (err) {
        const error = new APIError({
          message: httpStatus.getStatusText(httpStatus.UNAUTHORIZED),
          status: httpStatus.UNAUTHORIZED
        })
        return next(error)
      }
      else {
        const { id, accessLevel } = decoded
        // Admin.
        if (accessLevel === usersConstants.USER_ACCESS_ADMIN) {
          req.app.set('user', { uid: id, accessLevel })
          return next()
        }
        // Authed.
        else if (accessLevel === usersConstants.USER_ACCESS_AUTHED &&
                  al === usersConstants.USER_ACCESS_AUTHED) {
          req.app.set('user', { uid: id, accessLevel })
          return next()
        }
        // Viewer.
        else if (accessLevel === usersConstants.USER_ACCESS_VIEWER &&
                  al === usersConstants.USER_ACCESS_VIEWER) {
          req.app.set('user', { uid: id, accessLevel })
          return next()
        }
        else {
          const error = new APIError({
            message: httpStatus.getStatusText(httpStatus.FORBIDDEN),
            status: httpStatus.FORBIDDEN
          })
          return next(error)
        }
      }
    })
  }
  else {
    const error = new APIError({
      message: httpStatus.getStatusText(httpStatus.UNAUTHORIZED),
      status: httpStatus.UNAUTHORIZED
    })
    return next(error)
  }
}
