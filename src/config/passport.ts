import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import passportLocal, { IVerifyOptions } from 'passport-local'
import passportJwt from 'passport-jwt'

import { User, UserDocument } from '../models/UserModel'
import { ApiErrorForbidden } from '../helpers'
import { UserRoles } from '../enums'
import { config } from './config'

const LocalStrategy = passportLocal.Strategy
const JwtStrategy = passportJwt.Strategy

/**
 * Sign in using Username and Password.
 */
passport.use(
  'local',
  new LocalStrategy({ usernameField: 'username', session: false }, (username, password, done) => {
    User.findOne({ username }, (err, user: UserDocument) => {
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
      secretOrKey: config.jwtSecret,
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
      (err, user: UserDocument, info: IVerifyOptions) => {
        const { role } = user as UserDocument
        if (
          // Admin.
          role === UserRoles.admin ||
          // Editor.
          (role === UserRoles.editor && userRole === UserRoles.editor) ||
          // Viewer.
          (role === UserRoles.viewer && userRole === UserRoles.viewer)
        ) {
          // Set authenticated user object to the request.
          req.user = user
          return next()
        } else {
          return next(new ApiErrorForbidden())
        }
      },
    )(req, res, next)
  }
}
