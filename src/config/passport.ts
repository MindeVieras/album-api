import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import passportLocal, { IVerifyOptions } from 'passport-local'
import passportJwt from 'passport-jwt'

import { Config, UserRoles, User, IUserObject } from 'album-sdk'

import { ApiErrorForbidden } from '../helpers'

const LocalStrategy = passportLocal.Strategy
const JwtStrategy = passportJwt.Strategy

/**
 * Sign in using Username and Password.
 */
passport.use(
  'local',
  new LocalStrategy({ usernameField: 'username', session: false }, async (username, password, done) => {
    const errorMessage = { message: 'Invalid username or password' }
    try {
      const user = await User.findOne({ username })

      if (!user) {
        return done(undefined, false, errorMessage)
      }
      if (await user.comparePassword(password)) {
        return done(undefined, user)
      }
      return done(undefined, false, errorMessage)
    } catch (err) {
      console.error(err)
      return done(undefined, false, errorMessage)
    }
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
