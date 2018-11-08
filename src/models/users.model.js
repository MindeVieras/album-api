
import bcrypt from 'bcrypt'
import validator from 'validator'
import moment from 'moment'

import { Database } from '../db'

import { usersConstants } from '../constants'
import { jsonResponse, makeInitials } from '../helpers'

let conn = new Database()

/**
 * @api {get} /users Get list
 * @apiName GetUsers
 * @apiGroup Users
 * 
 * @apiPermission admin
 *
 * @apiSuccess {String}   status                 Response status
 * @apiSuccess {Object}   data                   Response data
 * @apiSuccess {Object[]} data.users               List of users (Array of Objects)
 * @apiSuccess {Number}   data.users.id              User id
 * @apiSuccess {String}   data.users.username        User username
 * @apiSuccess {String}   data.users.email           User email address
 * @apiSuccess {String}   data.users.displayName     User display name
 * @apiSuccess {String}   data.users.initials        User initials made from username and display name
 * @apiSuccess {Number}   data.users.accessLevel     User access level
 * @apiSuccess {Number}   data.users.status          User status, enabled or disabled
 * @apiSuccess {Number}   data.users.author          User author id
 * @apiSuccess {Date}     data.users.created         User creation datetime
 * @apiSuccess {Date}     data.users.lastLogin       User last login datetime or null
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *          users: [
 *            {
 *              "id": 1,
 *              "username": "demouser",
 *              "email": "demo@example.com",
 *              "displayName": "Demo User",
 *              "initials": "DU",
 *              "accessLevel": 100,
 *              "status": 1,
 *              "author": 1,
 *              "created": "2017-12-31T01:16:54.000Z",
 *              "lastLogin": "2018-11-04T11:43:21.000Z"
 *            },
 *            ...
 *          ]       
 *        }
 *     }
 *
 * @apiUse AccessForbiddenError
 * @apiUse InternalServerError
 * 
 */
export function getList(req, res){

  conn.query(`SELECT idd, username, email, display_name, access_level, last_login, status, created, author FROM users`)
    .then(rows => {

      let data = { users: rows.map(u => {

        // make initials
        const initials = makeInitials(u.username, u.display_name)

        return {
          id: u.id,
          username: u.username,
          email: u.email,
          displayName: u.display_name,
          initials,
          accessLevel: u.access_level,
          status: u.status,
          author: u.author,
          created: u.created,
          lastLogin: u.last_login
        }
      })}

      jsonResponse.success(res, data)

    })
    .catch(err => {
      jsonResponse.error(res, err)
    })
}

// Creates user
export function createUser(req, res) {

  const { uid } = req.app.get('user')
  const { username, password, email, display_name, access_level, status } = req.body
  let  errors

  // validate username input
  if (!username || validator.isEmpty(username))
    errors = { ...errors, username: `Username is required` }
  else if (!validator.isAlphanumeric(username))
    errors = { ...errors, username: `Username must be alphanumeric only` }
  else if (validator.isLength(username, { min: 0, max: 4 }))
    errors = { ...errors, username: `Username must be at least 5 chars long` }

  // vlaidate password input
  if (!password || validator.isEmpty(password))
    errors = { ...errors, password: `Password is required` }
  else if (validator.isLength(password, { min: 0, max: 4 }))
    errors = { ...errors, password: `Password must be at least 5 chars long` }


  // vlaidate email
  if (email && !validator.isEmail(email))
    errors = { ...errors, email: `Email must be valid` }

  // vlaidate access_level
  if (!access_level || validator.isEmpty(access_level))
    errors = { ...errors, access_level: `Access level is required` }
  else if (!validator.isInt(access_level, { min: 0, max: 100 }))
    errors = { ...errors, access_level: `Access level is invalid` }

  // return errors if any
  if (errors) {
    res.json({ ack: `err`, errors })
  }

  else {

    let userData

    // check if user exists
    conn.query(`SELECT * FROM users WHERE username = ? LIMIT 1`, username)
      .then(rows => {
        if (rows.length)
          throw `Username already exists`
        else
          // hash password
          return bcrypt.hash(password, 10)
      })

      .then(hash => {

        // Save user to database
        userData = {
          username,
          email,
          password: hash,
          display_name,
          access_level: parseInt(access_level),
          author: uid,
          status: status ? usersConstants.USER_ACTIVE : usersConstants.USER_PASSIVE
        }
        return conn.query(`INSERT INTO users set ? `, userData)
      })

      // Insret initial user settings
      .then(userRow => {
        if (userRow.affectedRows === 1) {

          let newUid = userRow.insertId
          userData.id = newUid

          // make front settings array
          let frontSettings = [
            [newUid, 'c_menu_x', 90, 'front'],
            [newUid, 'c_menu_y', 90, 'front']
          ]
          // make admin settings array
          let filter_start_date = moment().subtract(100, 'year').format('YYYY-MM-DD')
          let filter_end_date = moment().add(100, 'year').format('YYYY-MM-DD')
          let adminSettings = [
            [newUid, 'selected_album', 0, 'admin'],
            [newUid, 'sidebar_width', usersConstants.USER_DEFAULT_SIDEBAR_WIDTH, 'admin'],
            [newUid, 'list_filter_start_date', filter_start_date, 'admin'],
            [newUid, 'list_filter_end_date', filter_end_date, 'admin']
          ]

          let settings = frontSettings

          if (userData.access_level >= usersConstants.USER_ACCESS_AUTHED) {
            settings = [ ...frontSettings, ...adminSettings ]
          }

          // insert settings to DB
          const sql = `INSERT INTO users_settings (user_id, name, value, type) VALUES ?`
          return conn.query(sql, [settings])
        }
        else {
          throw `Could not save user settings`
        }
      })

      .then(rows => {

        // Remove password from user object
        let { password, ...userCopy } = userData

        // make initials
        let { username, display_name } = userCopy
        let initials = makeInitials(username, display_name)

        let user = { initials, ...userCopy }

        res.json({ ack: `ok`, msg: `User saved`, user })
      })

      .catch( err => {
        let msg = err.sqlMessage ? `Cannot create user, check system logs` : err
        res.json({ ack: `err`, errors: { _error: msg } })
      })
  }
}

// Gets one user
export function getUser(req, res){

  const { username } = req.params

  conn.query(`SELECT * FROM users WHERE username = ?`, username)
    .then( rows => {
      if (rows.length) {

        let initials = require('../helpers/utils').makeInitials(rows[0].username, rows[0].display_name)

        let user = {
          id: rows[0].id,
          initials,
          username: rows[0].username,
          display_name: rows[0].display_name,
          email: rows[0].email
        }

        res.json({ack:'ok', msg: 'One user', data: user})

      }
      else {
        throw 'No such User'
      }
    })
    .catch(err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Deletes user
export function deleteUser(req, res){

  const { uid } = req.app.get('user')
  const { id } = req.params

  // Prevent deleting yourself
  if (uid != id) {

    conn.query(`DELETE FROM users WHERE id = ?`, id)
      .then(rows => {
        if (rows.affectedRows === 1)
          // Also delete user settings
          return conn.query(`DELETE FROM users_settings WHERE user_id = ?`, id)
        else
          throw `No such user`
      })

      .then(_ => {
        // Return success
        res.json({ack:`ok`, msg:`User deleted`, id})
      })

      .catch(err => {
        let msg = err.sqlMessage ? 'Cannot delete user, check system logs' : err
        res.json({ack:`err`, msg})
      })
  }
  else {
    res.json({ack:`err`, msg:`You cannot delete yoursef`})
  }
}
