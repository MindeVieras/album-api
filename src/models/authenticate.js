
import bcrypt from 'bcrypt'
import validator from 'validator'
import { Database } from '../db'
import jwt from 'jsonwebtoken'
import moment from 'moment'

import Config from '../config/config'

let conn = new Database()

// Authenticates user
const Authenticate = (req, res) => {

  const { username, password } = req.body
  
  // // vlaidate input
  if (validator.isEmpty(username)) {
    res.json({ack:'err', msg: 'Username is required'})
  }
  else if (validator.isEmpty(password)) {
    res.json({ack:'err', msg: 'Password is required'})
  }
  else {
    let user
    conn.query(`SELECT * FROM users WHERE username = ? LIMIT 1`, username)
      .then( rows => {
        if (rows.length){
          let pass = rows[0].password
          let passMatch = bcrypt.compareSync(password, pass)
          if (passMatch) {
            user = rows[0]
            let uid = rows[0].id
            let login_date = moment().format('YYYY-MM-DD HH:mm:ss')
            return conn.query('UPDATE users SET last_login = ? WHERE id = ?', [login_date, uid])
          }
          else {
            throw 'Incorect details'
          }
        }
        else {
          throw 'Incorrect details'
        }
      })
      .then( rows => {
        // If last login date updated
        if (rows.affectedRows === 1) {
          // Return User object
          const { id, username, access_level, display_name, email, created } = user
          const jwtData = { id, username, access_level }
          const token = jwt.sign(jwtData, Config.secret_key)
          let accessLevel = 'simple'
          if (access_level >= 50 && access_level < 100) {
            accessLevel = 'editor'
          } else if (access_level === 100) {
            accessLevel = 'admin'
          }
          let userData = { id, username, display_name, email, created, token, access_level: accessLevel }
          res.json({ack:'ok', msg: 'Authentication ok', data: userData})
        }
        else {
          throw 'Connot set last login date'
        }
      })
      .catch( err => {
        let msg = err.sqlMessage ? err.sqlMessage : err
        res.json({ack:'err', msg})
      })
  }


};

export default Authenticate
