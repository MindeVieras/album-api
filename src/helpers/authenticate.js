
import jwt from 'jsonwebtoken'

import { usersConstants } from '../constants'
import { secret_key } from '../config/config'

// check if user is viewer
export function isViewer(req, res, next) {
  doAuth(req, res, next, 25)
}
// check if user authenticated
export function isAuthed(req, res, next) {
  doAuth(req, res, next, 50)
}
// // check if user admin
export function isAdmin(req, res, next) {
  doAuth(req, res, next, 100)
}

function doAuth(req, res, next, al) {
  const bearerHeader = req.headers['authorization']
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    const bearerToken = bearer[1]
    jwt.verify(bearerToken, secret_key, (err, decoded) => {
      if (err) {
        res.json({ack:'err', msg: err.message})
      } else {
        const { id, access_level } = decoded
        if (access_level === 100) {
          req.app.set('user', { uid: id, access_level })
          next()
        } else if (access_level <= 50 && al === 50) {
          req.app.set('user', { uid: id, access_level })
          next()
        } else {
          res.json({ack:'err', msg: 'Access denied'})
        }
      }
    })
  } else {
    res.json({ack:'err', msg: 'Not authorized'})
  }
}
