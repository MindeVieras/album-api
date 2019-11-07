
import request from 'superagent'

import { config } from '../config'
import { Database } from '../db'
import { jsonResponse, makeInitials } from '../helpers'

let conn = new Database()

/**
 * @api {get} /utils/ip-location/:ip Get Ip Location
 * @apiName GetIpLocation
 * @apiGroup Utils
 * 
 * @apiPermission authed
 * 
 * @apiParam {String} ip IP address
 *
 * @apiSuccess {String} status   Response status
 * @apiSuccess {Object} data     Response data
 * @apiSuccess {Number} data.lat  Latitude
 * @apiSuccess {Number} data.lng  Longitude
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *          lat: 1.23456,
 *          lng: -1.23456
 *        }
 *     }
 *
 */
export function ipLocation(req, res) {

  const { ip } = req.params

  let data = {
    lat: 0,
    lng: 0
  }

  request
    .get(`https://ipapi.co/${ip}/json/`)
    .then((ipRes) => {
      console.log(ipRes)
      let { latitude, longitude } = JSON.parse(ipRes.text)

      if (latitude && longitude) {
        data = {
          lat: latitude,
          lng: longitude
        }
      }

      jsonResponse.success(res, data)
    })
    .catch(err => {
      jsonResponse.success(res, data)
    })
}

// Gets App settings
export function getAppSettings(req, res) {
  let settings = new Object()
  // @ts-ignore
  conn.query(`SELECT * FROM settings WHERE type = 'app'`)
    .then(rows => {
      // let settingsObj = new Object()
      rows.map((s) => {
        settings[s.name] = s.value
      })

      // Add AWS access key
      // @ts-ignore
      settings.access_key_id = config.aws.accessKey
      // Add AWS bucket
      // @ts-ignore
      settings.bucket = config.aws.bucket

      // Return settings
      res.json({ ack: 'ok', msg: 'App settings', data: settings })
    })
    .catch(err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ ack: 'err', msg })
    })
}

// Gets Admin settings
export function getAdminSettings(req, res) {
  const { uid } = req.app.get('user')
  let settings = new Object()
  conn.query(`SELECT * FROM users_settings WHERE user_id = ? AND type = 'admin'`, uid)
    .then(rows => {
      // let settingsObj = new Object()
      // @ts-ignore
      rows.map((s) => {
        settings[s.name] = s.value
      })

      // Return settings
      res.json({ ack: 'ok', msg: 'Admin settings', data: settings })
    })
    .catch(err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ ack: 'err', msg })
    })
}

// Saves admin setting
export function saveAdminSetting(req, res) {
  const { name, value } = req.body
  const { uid } = req.app.get('user')

  let data = [value, uid, name]

  conn.query(`UPDATE users_settings
                SET value = ?
              WHERE user_id = ? AND name = ? AND type = 'admin'`, data)
    .then(row => {
      // @ts-ignore
      if (row.affectedRows === 1) {
        res.json({ ack: 'ok', msg: 'Setting saved' })
      }
      else {
        throw 'Setting not saved'
      }
    })
    .catch(err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ ack: 'err', msg })
    })
}

// Gets Front settings
export function getFrontSettings(req, res) {

  const { uid } = req.app.get('user')
  let settings = new Object()
  conn.query(`SELECT * FROM users_settings WHERE user_id = ? AND type = 'front'`, uid)
    .then(rows => {
      // let settingsObj = new Object()
      // @ts-ignore
      rows.map((s) => {
        settings[s.name] = s.value
      })

      // Return settings
      res.json({ ack: 'ok', msg: 'Front settings', data: settings })
    })
    .catch(err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ ack: 'err', msg })
    })
}

// Saves front setting
export function saveFrontSetting(req, res) {
  const { name, value } = req.body
  const { uid } = req.app.get('user')

  let data = [value, uid, name]

  conn.query(`UPDATE users_settings
                SET value = ?
              WHERE user_id = ? AND name = ? AND type = 'front'`, data)
    .then(row => {
      // @ts-ignore
      if (row.affectedRows === 1) {
        res.json({ ack: 'ok', msg: 'Setting saved' })
      }
      else {
        throw 'Setting not saved'
      }
    })
    .catch(err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ ack: 'err', msg })
    })
}
