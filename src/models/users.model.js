
import bcrypt from 'bcrypt'
import validator from 'validator'
const connection = require('../config/db')
import { makeInitials } from '../helpers/utils'

import { Database } from '../db'

let conn = new Database()

// Creates user
export function create(req, res) {

  const input = req.body
  // // vlaidate input
  if (validator.isEmpty(input.username)) {
    res.json({ack:'err', msg: 'Username is required'})
  } else if (validator.isLength(input.username, {min:0, max:4})) {
    res.json({ack:'err', msg: 'Username must be at least 5 chars long'})
  } else if (!validator.isEmail(input.email) && !validator.isEmpty(input.email)){
    res.json({ack:'err', msg: 'Email must be valid'})
  } else if (validator.isEmpty(input.password)){
    res.json({ack:'err', msg: 'Password is required'})
  } else if (validator.isLength(input.password, {min:0, max:4})) {
    res.json({ack:'err', msg: 'Password must be at least 5 chars long'})
  } else {
    // check if user exists
    connection.query('SELECT * FROM users WHERE username = ? LIMIT 1', [input.username], (err, rows) => {
      if(err) {
        res.json({ack:'err', msg: err.sqlMessage})
      } else {
        if (rows.length) {
          res.json({ack:'err', msg: 'Username already taken'})
        } else {
          // hashes password
          bcrypt.hash(input.password, 10, (err, hash) => {
            if (err) {
              res.json({ack:'err', msg: 'Cannot hash password'})
            } else {
              let data = {
                username : input.username,
                email : input.email,
                password: hash,
                display_name: input.display_name,
                access_level: input.access_level,
                author: input.author,
                status: input.status ? 1 : 0
              }
              // console.log(data);
              connection.query('INSERT INTO users set ? ', data, (err, rows) => {
                if(err) {
                  res.json({ack:'err', msg: err.sqlMessage})
                } else {
                  // Attach avatar to user if any
                  if (input.avatar.id) {
                    connection.query('UPDATE media SET entity_id = ? WHERE id = ?', [rows.insertId, input.avatar.id])
                  }
                  res.json({ack:'ok', msg: 'User saved', id: rows.insertId})
                }
              })
            }
          })
        }
      }
    })
  }
}

// Gets users list
export function getList(req, res){

  let users
  conn.query(`SELECT * FROM users`)
    .then( rows => {
      users = rows.map(u => {
        const { id, username, display_name, email } = u
        const initials = makeInitials(username, display_name)

        return { id, initials, username, display_name, email }
      })
      res.json({ack:'ok', msg: 'Users list', list: users})
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
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

    connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, rows) => {
      if(err) {
        res.json({ack:'err', msg: err.sqlMessage})
      } else {
        if (rows.affectedRows === 1) {
          res.json({ack:'ok', msg: 'User deleted', data: req.params.id})
        } else {
          res.json({ack:'err', msg: 'No such user'})
        }
      }
    })

  } else {
    res.json({ack:'err', msg: 'bad parameter'})
  }
}
