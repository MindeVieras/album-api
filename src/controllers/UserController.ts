
import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'

import { User } from '../models'

/**
 * User controller class.
 */
export class UserController {

  /**
   * Authenticate user.
   */
  public async authorize(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body

      // // Check if user exists.
      // const user = await User.findOne({ username })
      // console.log(user)
      // const user = new User()
      // res.send(user.initials())
      // if (existingUser) {
      //   res.send(existingUser)
      // }
        // .then(user => {
        //   const error = {
        //     status: HttpStatus.UNAUTHORIZED,
        //     message: 'Incorrect login details'
        //   }
        //   if (!user) throw new APIError(error)
        //   const { _id, username, email, phone, hash } = user
        //   if (!bcrypt.compareSync(req.body.password, hash)) throw new APIError(error)

        //   // User object for token.
        //   const userObject = {
        //     id: _id,
        //     username,
        //     email,
        //     phone
        //   }
        //   const token = jwt.sign(userObject, config.jwtSecret)
        //   const data = { ...userObject, token }
        //   return new APISuccess(res, data)
        // })
        // .catch(e => next(e))

      // const { password } = req.body

      // // Remove password from request as soon as possible.
      // delete req.body.password

      // // Create hash from password.
      // const salt = await bcrypt.genSalt(10)
      // const hashed = await bcrypt.hash(password, salt)

      // // Create user data object.
      // const userDataToSave = { ...req.body, hash: hashed }

      // // Save user to database.
      // const user = new User(userDataToSave)
      // const savedUser = await user.save()


// import bcrypt from 'bcrypt'
// import validator from 'validator'
// import jwt from 'jsonwebtoken'
// import moment from 'moment'

// import { config } from '../config'

// import { Database } from '../db'
// let conn = new Database()

// // Authenticates user
// export function authenticate(req, res) {

//   const { username, password } = req.body
//   let errors

//   // validate username input
//   if (!username || validator.isEmpty(username)) {
//     errors = {
//       ...errors,
//       username: 'Username is required'
//     }
//   }

//   // validate password input
//   if (!password || validator.isEmpty(password)) {
//     errors = {
//       ...errors,
//       password: 'Password is required'
//     }
//   }

//   // return errors if any
//   if (errors) {
//     res.json({ ack: 'err', errors })
//   }

//   else {
//     let user
//     conn.query(`SELECT * FROM users WHERE username = ? LIMIT 1`, username)
//       .then(rows => {
//         // @ts-ignore
//         if (rows.length) {
//           let pass = rows[0].password
//           let passMatch = bcrypt.compareSync(password, pass)

//           if (passMatch) {

//             // remove password from user object
//             const { password, ...noPasswordUser } = rows[0]
//             user = noPasswordUser

//             // Update user login datetime
//             let uid = user.id
//             let login_date = moment().format('YYYY-MM-DD HH:mm:ss')
//             return conn.query('UPDATE users SET last_login = ? WHERE id = ?', [login_date, uid])
//           }
//           else {
//             throw 'Incorrect details'
//           }
//         }
//         else {
//           throw 'Incorrect details'
//         }
//       })
//       .then(rows => {
//         // If last login date updated
//         // @ts-ignore
//         if (rows.affectedRows === 1) {
//           // Return User object
//           const token = jwt.sign(user, config.jwtSecret)
//           let data = { ...user, token }
//           res.json({ ack: 'ok', msg: 'Authentication ok', data })
//         }
//         else {
//           throw 'Authentication failed. Please try again later.'
//         }
//       })
//       .catch(err => {
//         let msg = err.sqlMessage ? 'Authentication failed. Please try again later.' : err
//         res.json({ ack: 'err', errors: { _error: msg } })
//       })
//   }
// }


    } catch (err) {
      next(err)
    }
  }

  /**
   * Create new user.
   */
  public async create(req: Request, res: Response, next: NextFunction) {
    try {

      const { password } = req.body

      // Remove password from request as soon as possible.
      delete req.body.password

      // Create hash from password.
      const salt = await bcrypt.genSalt(10)
      const hashed = await bcrypt.hash(password, salt)

      // Create user data object.
      const userDataToSave = { ...req.body, hash: hashed }

      // Save user to database.
      const user = new User(userDataToSave)
      const savedUser = await user.save()

      res.send(savedUser)

    } catch (err) {
      next(err)
    }
  }

  /**
   * Get list of users.
   */
  public async getList(req: Request, res: Response) {
    try {

      const users = await User.find()
      res.send(users)

    } catch (err) {
      console.log(err)
    }
  }
}
