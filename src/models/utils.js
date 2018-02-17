
import { Database } from '../db'

let conn = new Database()

// Gets App settings
export function getAppSettings(req, res) {

  let settings = new Object()
  conn.query(`SELECT * FROM settings WHERE type = 'app'`)
    .then( rows => {
      // let settingsObj = new Object()
      rows.map((s) => {
        settings[s.name] = s.value
      })

      // Return settings
      res.json({ack:'ok', msg: 'App settings', data: settings});
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Gets Admin settings
export function getAdminSettings(req, res) {
  const { id } = req.app.get('user')
  let settings = new Object()
  conn.query(`SELECT * FROM users_settings WHERE user_id = ? AND type = 'admin'`, id)
    .then( rows => {
      // let settingsObj = new Object()
      rows.map((s) => {
        settings[s.name] = s.value
      })

      // Return settings
      res.json({ack:'ok', msg: 'Admin settings', data: settings});
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Saves admin setting
export function saveAdminSetting(req, res) {
  const { name, value } = req.body
  const { id } = req.app.get('user')
  
  let data = [ value, id, name ]

  conn.query(`UPDATE users_settings
                SET value = ?
              WHERE user_id = ? AND name = ? AND type = 'admin'`, data)
    .then( row => {      
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'Setting saved'});
      }
      else {
        throw 'Setting not saved'
      }
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Gets Front settings
export function getFrontSettings(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const { id } = req.params
    let settings = new Object()
    conn.query(`SELECT * FROM users_settings WHERE user_id = ? AND type = 'front'`, id)
      .then( rows => {
        // let settingsObj = new Object()
        rows.map((s) => {
          settings[s.name] = s.value
        })

        // Return settings
        res.json({ack:'ok', msg: 'Front settings', data: settings});
      })
      .catch( err => {
        let msg = err.sqlMessage ? err.sqlMessage : err
        res.json({ack:'err', msg})
      })
  
  } else {
    res.json({ack:'err', msg: 'bad parameter'})
  }
}

// Saves front setting
export function saveFrontSetting(req, res) {
  const { name, value, uid } = req.body

  let data = [ value, uid, name ]

  conn.query(`UPDATE users_settings
                SET value = ?
              WHERE user_id = ? AND name = ? AND type = 'front'`, data)
    .then( row => {      
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'Setting saved'});
      }
      else {
        throw 'Setting not saved'
      }
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}
