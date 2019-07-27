
import { APISuccess } from '../helpers'
import UserClass from '../classes/UserClass'

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
    const user = new UserClass()
    const authedUser = await user.login(username, password)
    return new APISuccess(res, authedUser)
  }
  catch (error) {
    return next(error)
  }
}
