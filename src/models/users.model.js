
import bcrypt from 'bcrypt'
import validator from 'validator'
const connection = require('../config/db')
import { makeInitials } from '../helpers/utils'

import { Database } from '../db'

let conn = new Database()

// Gets users list
export function getList(req, res){

  let users
  conn.query(`SELECT * FROM users`)
    .then( rows => {
      users = rows.map(u => {
        const { id, username, display_name } = u
        const initials = makeInitials(username, display_name)

        return { id, initials, username, display_name }
      })
      res.json({ack:`ok`, msg:`Users list`, list: users})
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:`err`, msg})
    })
}

// Creates user
export function create(req, res) {

  const { uid } = req.app.get('user')
  const { username, password, email, display_name, access_level, status } = req.body

  // vlaidate username
  if (!username || validator.isEmpty(username))
    res.json({ack:`err`, msg:`Username is required`})
  else if (validator.isLength(username, {min:0, max:4}))
    res.json({ack:`err`, msg:`Username must be at least 5 chars long`})

  // vlaidate email
  else if (email && !validator.isEmail(email))
    res.json({ack:`err`, msg:`Email must be valid`})

  // vlaidate password
  else if (!password || validator.isEmpty(password))
    res.json({ack:`err`, msg:`Password is required`})
  else if (validator.isLength(password, {min:0, max:4}))
    res.json({ack:`err`, msg:`Password must be at least 5 chars long`})

  // vlaidate access_level
  else if (!access_level || validator.isEmpty(access_level))
    res.json({ack:`err`, msg:`Access level is required`})
  else if (!validator.isInt(access_level, {min:0, max:100}))
    res.json({ack:`err`, msg:`Access level is invalid`})

  else {

    let userData

    // check if user exists
    conn.query(`SELECT * FROM users WHERE username = ? LIMIT 1`, username)
      .then(rows => {
        if (rows.length)
          throw `Username already taken`

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
          status: status ? 1 : 0
        }
        return conn.query(`INSERT INTO users set ? `, userData)
      })

      .then(rows => {
        let {password, ...user} = userData
        res.json({ack:`ok`, msg:`User saved`, user})
      })

      .catch( err => {
        let msg = err.sqlMessage ? err.sqlMessage : err
        res.json({ack:`err`, msg})
      })
  }
}

// Gets one user
export function getOne(req, res){
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    connection.query(`SELECT
                        u.*,
                        m.s3_key
                      FROM users AS u
                        LEFT JOIN media AS m ON u.id = m.entity_id
                      WHERE u.id = ?
                      LIMIT 1`, [req.params.id], (err, rows) => {
      if(err) {
        res.json({ack:'err', msg: err.sqlMessage})
      } else {
        if (rows.length) {
          let initials = require('../helpers/utils').makeInitials(rows[0].username, rows[0].display_name)
          let avatar = false
          if (rows[0].s3_key) {
            avatar = require('../helpers/media').img(rows[0].s3_key)
          }
          const user = {
            id: rows[0].id,
            initials,
            username: rows[0].username,
            display_name: rows[0].display_name,
            email: rows[0].email,
            avatar
          }
          res.json({ack:'ok', msg: 'One user', data: user})
        } else {
          res.json({ack:'err', msg: 'No such user'})
        }
      }
    })
  } else {
    res.json({ack:'err', msg: 'bad parameter'})
  }
}

// Deletes user
export function _delete(req, res){
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {

    const { id } = req.params

    conn.query(`DELETE FROM users WHERE id = ?`, id)
      .then( rows => {
        if (rows.affectedRows === 1)
          // Return success
          res.json({ack:`ok`, msg:`User deleted`, id})
        else
          throw `No such user`
      })
      .catch( err => {
        let msg = err.sqlMessage ? err.sqlMessage : err
        res.json({ack:`err`, msg})
      })

  } else {
    res.json({ack:`err`, msg:`bad parameter`})
  }
}