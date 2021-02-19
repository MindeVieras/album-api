import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import passportLocal, { IVerifyOptions } from 'passport-local'
import passportJwt from 'passport-jwt'

import { Config } from 'album-api-config'

import { User, IUserObject } from '../models/UserModel'
import { ApiErrorForbidden } from '../helpers'
import { UserRoles } from '../enums'

const LocalStrategy = passportLocal.Strategy
const JwtStrategy = passportJwt.Strategy

/**
 * Sign in using Username and Password.
 */
passport.use(
  'local',
  new LocalStrategy({ usernameField: 'username', session: false }, (username, password, done) => {
    User.findOne({ username }, null, null, (err, user) => {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(undefined, false, { message: 'Invalid username or password' })
      }
      user
        .comparePassword(password)
        .then((isMatch: boolean) => {
          if (isMatch) {
            return done(undefined, user)
          }
          return done(undefined, false, { message: 'Invalid username or password' })
        })
        .catch((err) => {
          return done(err)
        })
    })
  }),
)

// We use this to extract the JWT sent by the user.
const ExtractJWT = passportJwt.ExtractJwt

// This verifies that the token sent by the user is valid.
passport.use(
  'jwt',
  new JwtStrategy(
    {
      // Secret we used to sign our JWT.
      secretOrKey: Config.jwtSecret,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token: string, done) => {
      try {
        //Pass the user details to the next middleware
        return done(null, token)
      } catch (error) {
        done(error)
      }
    },
  ),
)

/**
 * Check if user is authenticated.
 */
export function isAuthed(userRole: UserRoles) {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'jwt',
      { session: false },
      (err, user: IUserObject, info: IVerifyOptions) => {
        const { role } = user
        if (
          // Admin.
          role === UserRoles.admin ||
          // Editor.
          (role === UserRoles.editor && userRole === UserRoles.editor) ||
          // Viewer.
          (role === UserRoles.viewer && userRole === UserRoles.viewer)
        ) {
          // Set authenticated user object to the request.
          req.authedUser = user
          return next()
        } else {
          return next(new ApiErrorForbidden())
        }
      },
    )(req, res, next)
  }
}
