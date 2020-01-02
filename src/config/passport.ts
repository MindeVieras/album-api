import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import httpStatus from 'http-status-codes'
import passportLocal from 'passport-local'

import { User, UserDocument } from '../models/UserModel'
import { ApiError } from '../helpers'
import { UserRoles } from '../enums'

const LocalStrategy = passportLocal.Strategy

/**
 * Serialize user to the session.
 */
passport.serializeUser<UserDocument, string>((user, done) => {
  done(undefined, user.id)
})

/**
 * Deserialize user from the session.
 */
passport.deserializeUser<UserDocument | null, string>((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

/**
 * Sign in using Username and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
    User.findOne({ username }, (err, user: UserDocument) => {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(undefined, false, { message: 'Invalid username or password.' })
      }
      user
        .comparePassword(password)
        .then((isMatch: boolean) => {
          if (isMatch) {
            return done(undefined, user)
          }
          return done(undefined, false, { message: 'Invalid username or password.' })
        })
        .catch((err) => {
          return done(err)
        })
    })
  }),
)

/**
 * Check if user is authenticated.
 */
export function isAuthed(userRole: UserRoles) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      const { role } = req.user as UserDocument
      if (
        // Admin.
        role === UserRoles.admin ||
        // Authed.
        (role === UserRoles.authed && userRole === UserRoles.authed) ||
        // Viewer.
        (role === UserRoles.viewer && userRole === UserRoles.viewer)
      ) {
        return next()
      } else {
        return next(
          new ApiError(httpStatus.getStatusText(httpStatus.FORBIDDEN), httpStatus.FORBIDDEN),
        )
      }
    }
    return next(new ApiError(httpStatus.getStatusText(httpStatus.FORBIDDEN), httpStatus.FORBIDDEN))
  }
}
