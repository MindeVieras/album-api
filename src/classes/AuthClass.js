
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import httpStatus from 'http-status-codes'

import config from '../config/config'
import { APIError } from '../helpers'
import { Users } from '../models'
import UserClass from './UserClass'

class AuthClass extends UserClass {
  // constructor(username, password) {
  //   super(username, password)
  // }

  /**
   * Authenticate user and return token.
   *
   * @param {string} username - Username.
   * @param {string} password - Password for the user.
   *
   * @returns
   *   Object with JWT payload and a token.
   */
  async login(username, password) {
    // this.username = username
    // this.password = password

    // First get user by username.
    const user = await this.loadByUsername(username)

    if (user) {
      // Throw an error if passwords does not match.
      const passMatch = await bcrypt.compare(password, user.get('hash'))
      if (!passMatch) {
        throw new APIError({
          status: httpStatus.UNAUTHORIZED,
          message: 'Incorrect details.',
        })
      }

      // Create JWT payload - data that can be decoded after verifying token.
      const jwtPayload = {
        id: user.get('id'),
        username: user.get('username'),
        accessLevel: user.get('accessLevel'),
      }

      // Generate JWT token.
      const token = jwt.sign(jwtPayload, config.jwtSecret)

      // Set user last login date.
      Users.update({ lastLogin: new Date() }, {
        where: { id: user.get('id') },
      })

      // Return payload with token.
      return { ...jwtPayload, token }
    }

    // Throw an error if user by username not found.
    throw new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'Incorrect details.',
    })
  }
}

export default AuthClass
