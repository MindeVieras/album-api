
import jwt from 'jsonwebtoken'

import { usersConstants } from '../constants'
import { secret_key } from '../config/config'

// check if user admin
export function isAdmin(req, res, next) {
  doAuth(req, res, next, usersConstants.USER_ACCESS_ADMIN)
}
// check if user authenticated
export function isAuthed(req, res, next) {
  doAuth(req, res, next, usersConstants.USER_ACCESS_AUTHED)
}
// check if user is viewer
export function isViewer(req, res, next) {
  doAuth(req, res, next, usersConstants.USER_ACCESS_VIEWER)
}

function doAuth(req, res, next, al) {

  const bearerHeader = req.headers['authorization']
  
  if (typeof bearerHeader !== 'undefined') {

    const bearer = bearerHeader.split(' ')
    const bearerToken = bearer[1]
    
    jwt.verify(bearerToken, secret_key, (err, decoded) => {

      if (err)
        res.json({ack:'err', msg: err.message})

      else {
        const { id, access_level } = decoded
        // Admin
        if (access_level === usersConstants.USER_ACCESS_ADMIN) {
          req.app.set('user', { uid: id, access_level })
          next()
        }
        // Authed
        else if (access_level === usersConstants.USER_ACCESS_AUTHED &&
                  al === usersConstants.USER_ACCESS_AUTHED) {
          req.app.set('user', { uid: id, access_level })
          next()
        }
        // Viewer
        else if (access_level === usersConstants.USER_ACCESS_VIEWER &&
                  al === usersConstants.USER_ACCESS_VIEWER) {
          req.app.set('user', { uid: id, access_level })
          next()
        }
        else {
          res.json({ack:'err', msg: 'Access denied'})
        }
      }
    })
  }
  
  else {
    res.status(401).json({ack:'err', msg: 'Not authorized'})
  }
}
