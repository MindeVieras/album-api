
import { Request, Response, NextFunction } from 'express'

// import AuthClass from '../classes/AuthClass'
import { APISuccess } from '../helpers'

/**
 * Authenticates user.
 *
 * @param {Request} req - Request.
 * @param {Response} res - Response.
 * @param {NextFunction} next - Send to error handler.
 *
 * @returns {APISuccess}
 *  Success JSON user data including token.
 */
export default async function authenticate(
  req: Request,
  res: Response,
  // next: NextFunction,
): Promise<APISuccess> {
  // Get request body values.
  const { username, password } = req.body

  return new APISuccess(res, req.body)
  // try {
  //   // const Auth = new AuthClass()
  //   // const authedUser = await Auth.login(username, password)
  //   return new APISuccess(res, 'dada')
  // } catch (error) {
  //   return next(error)
  // }
}
