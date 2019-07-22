
// import validator from 'validator'
// import jwt from 'jsonwebtoken'
// import moment from 'moment'

import { APIError, APISuccess } from '../helpers'
// import { secret_key } from '../config/config'
import UserClass from '../classes/UserClass'

// const Users = db.Users

// Authenticates user
export async function authenticate(req, res, next) {

  const { username, password } = req.body

  try {
    const user = new UserClass()
    const authedUser = await user.login(username, password)
    return new APISuccess(res, authedUser, 200, 'Authentication ok')
  }
  catch(error) {
    next(error)
  }

  // else {
  //   let user
  //   conn.query(`SELECT * FROM users WHERE username = ? LIMIT 1`, username)
  //     .then( rows => {
  //       if (rows.length){
  //         let pass = rows[0].password
  //         let passMatch = bcrypt.compareSync(password, pass)

  //         if (passMatch) {

  //           // remove password from user object
  //           const { password, ...noPasswordUser } = rows[0]
  //           user = noPasswordUser

  //           // Update user login datetime
  //           let uid = user.id
  //           let login_date = moment().format('YYYY-MM-DD HH:mm:ss')
  //           return conn.query('UPDATE users SET last_login = ? WHERE id = ?', [login_date, uid])
  //         }
  //         else {
  //           throw 'Incorrect details'
  //         }
  //       }
  //       else {
  //         throw 'Incorrect details'
  //       }
  //     })
  //     .then( rows => {
  //       // If last login date updated
  //       if (rows.affectedRows === 1) {
  //         // Return User object
  //         const token = jwt.sign(user, secret_key)
  //         let data = { ...user, token }
  //         res.json({ack:'ok', msg: 'Authentication ok', data})
  //       }
  //       else {
  //         throw 'Authentication failed. Please try again later.'
  //       }
  //     })
  //     .catch( err => {
  //       let msg = err.sqlMessage ? 'Authentication failed. Please try again later.' : err
  //       res.json({ack:'err', errors: { _error: msg }})
  //     })
  // }
}

// export default { authenticate }
