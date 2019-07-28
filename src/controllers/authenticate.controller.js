
import { APISuccess } from '../helpers'
import AuthClass from '../classes/AuthClass'

/**
 * Authenticates user.
 *
 * @param {*} req - Request.
 * @param {*} res - Response.
 * @param {*} next - Send to error handler.
 *
 * @returns {Promise}
 *  JSON user data including token.
 */
export default async function authenticate(req, res, next) {
  // Get request body values.
  const { username, password } = req.body

  try {
    const Auth = new AuthClass()
    const authedUser = await Auth.login(username, password)
    return new APISuccess(res, authedUser)
  }
  catch (error) {
    return next(error)
  }
}
