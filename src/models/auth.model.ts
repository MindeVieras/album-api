
import bcrypt from 'bcrypt'
import validator from 'validator'
import jwt from 'jsonwebtoken'
import moment from 'moment'

import { config } from '../config'

import { Database } from '../db'
let conn = new Database()

// Authenticates user
export function authenticate(req, res) {

  const { username, password } = req.body
  let errors

  // validate username input
  if (!username || validator.isEmpty(username)) {
    errors = {
      ...errors,
      username: 'Username is required'
    }
  }

  // validate password input
  if (!password || validator.isEmpty(password)) {
    errors = {
      ...errors,
      password: 'Password is required'
    }
  }

  // return errors if any
  if (errors) {
    res.json({ ack: 'err', errors })
  }

  else {
    let user
    conn.query(`SELECT * FROM users WHERE username = ? LIMIT 1`, username)
      .then(rows => {
        // @ts-ignore
        if (rows.length) {
          let pass = rows[0].password
          let passMatch = bcrypt.compareSync(password, pass)

          if (passMatch) {

            // remove password from user object
            const { password, ...noPasswordUser } = rows[0]
            user = noPasswordUser

            // Update user login datetime
            let uid = user.id
            let login_date = moment().format('YYYY-MM-DD HH:mm:ss')
            return conn.query('UPDATE users SET last_login = ? WHERE id = ?', [login_date, uid])
          }
          else {
            throw 'Incorrect details'
          }
        }
        else {
          throw 'Incorrect details'
        }
      })
      .then(rows => {
        // If last login date updated
        // @ts-ignore
        if (rows.affectedRows === 1) {
          // Return User object
          const token = jwt.sign(user, config.jwtSecret)
          let data = { ...user, token }
          res.json({ ack: 'ok', msg: 'Authentication ok', data })
        }
        else {
          throw 'Authentication failed. Please try again later.'
        }
      })
      .catch(err => {
        let msg = err.sqlMessage ? 'Authentication failed. Please try again later.' : err
        res.json({ ack: 'err', errors: { _error: msg } })
      })
  }
}