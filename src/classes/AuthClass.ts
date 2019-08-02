
import bcrypt from 'bcrypt'
import httpStatus from 'http-status-codes'
import jwt from 'jsonwebtoken'

import config from '../config/config'
import { APIError } from '../helpers'
import { Users } from '../models'
import UserClass from './UserClass'

/**
 * Authentication class. extended from User class.
 */
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
  public async login(username: string, password: string) {
    // this.username = username
    // this.password = password

    // First get user by username.
    const user = await this.loadByUsername(username)

    if (user) {
      // Throw an error if passwords does not match.
      const passMatch = await bcrypt.compare(password, user.get('hash'))
      if (!passMatch) {
        throw new APIError('Incorrect details.', httpStatus.UNAUTHORIZED)
      }

      // Create JWT payload - data that can be decoded after verifying token.
      const jwtPayload: object = {
        accessLevel: user.get('accessLevel'),
        id: user.get('id'),
        username: user.get('username'),
      }

      // Generate JWT token.
      const token: string = jwt.sign(jwtPayload, config.jwtSecret)

      // Set user last login date.
      Users.update({ lastLogin: new Date() }, {
        where: { id: user.get('id') },
      })

      // Return payload with token.
      return { ...jwtPayload, token }
    }

    // Throw an error if user by username not found.
    throw new APIError('Incorrect details.', httpStatus.UNAUTHORIZED)
  }
}

export default AuthClass
