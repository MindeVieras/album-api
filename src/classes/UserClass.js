
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import httpStatus from 'http-status-codes'

import config from '../config/config'
import { APIError } from '../helpers'
import { Users } from '../models'

class UserClass {

  /**
   * Authenticate user and return token.
   *
   * @param username
   *   Username.
   * @param password
   *   Password for the user.
   *
   * @returns
   *   Object with JWT payload and a token.
   */
  async login(username, password) {

    // First get user by username.
    const user = await Users.findOne({ where: { username } })
    if (user) {

      // Throw an error if passwords does not match.
      const passMatch = await bcrypt.compare(password, user.get('password'))
      if (!passMatch)
        throw new APIError({
          status: httpStatus.UNAUTHORIZED,
          message: 'Incorrect details.'
        })

      // Create JWT payload - data that can be decoded after verifying token.
      const jwtPayload = {
        id: user.get('id'),
        username: user.get('username')
      }

      // Generate JWT token.
      const token = jwt.sign(jwtPayload, config.jwtSecret)

      // Set user last login date.
      await Users.update({ lastLogin: new Date() }, {
        where: { id: user.get('id') }
      })

      // Return payload with token.
      return { ...jwtPayload, token }

    }

    // Throw an error if user by username not found.
    throw new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'Incorrect details.'
    })
  }

  /**
   * Check if user exists by given username.
   *
   * @param string
   *   Username to check.
   *
   * @returns bool
   *   Returns true if user exists, otherwise false.
   */
  async exists(username) {
    // Make query to to check if user exists.
    const user = await Users.findAll({ where: { username } })

    if (user.length > 0)
      return true

    return false
  }

}

export default UserClass
