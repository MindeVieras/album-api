
import { APISuccess } from '../helpers'
import UserClass from '../classes/UserClass'

// Authenticates user
export async function authenticate(req, res, next) {

  const { username, password } = req.body

  try {
    const user = new UserClass()
    const authedUser = await user.login(username, password)
    return new APISuccess(res, authedUser)
  }
  catch(error) {
    next(error)
  }

}
