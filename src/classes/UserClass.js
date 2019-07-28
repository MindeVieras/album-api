
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import httpStatus from 'http-status-codes'

import config from '../config/config'
import { APIError } from '../helpers'
import { Users } from '../models'

/**
 * The main user class.
 *
 * @class
 */
class UserClass {
  constructor() {
    this.user = null
    this.id = null
    this.username = ''
    this.hash = ''
    this.email = ''
    this.displayName = ''
    this.author = null
    this.accessLevel = null
    this.status = null
    this.lastLogin = null
    this.createdAt = null
    this.updatedAt = null
  }

  /**
   * Load user by username.
   *
   * @param {string} username - Username.
   * @param {number} status - User status, defaults to active.
   *
   * @returns {object|null} - User object or null if cannot find user.
   */
  async loadByUsername(username, status = 1) {
    // Load by username.
    this.user = await Users.findOne({ where: { username, status } })
    return this.user
    // if (user) {
    //   this.id = user.get('id')
    //   this.username = user.get('username')
    //   this.hash = user.get('hash')
    //   this.email = user.get('email')
    //   this.displayName = user.get('displayName')
    //   this.author = user.get('author')
    //   this.accessLevel = user.get('accessLevel')
    //   this.status = user.get('status')
    //   this.lastLogin = user.get('lastLogin')
    //   this.createdAt = user.get('createdAt')
    //   this.updatedAt = user.get('updatedAt')

    //   return this
    // }

    // return null
  }

  /**
   * Get list of users.
   *
   * @param page
   */
  async list(offset = 0, limit = 10) {
    const users = await Users.findAll({ offset, limit })
    return users
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
