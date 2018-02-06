
import { Database } from '../db'

let conn = new Database()

// // Gets user settings
// export function getUserSettings(req, res) {
//   if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
//     const { id } = req.params // User ID
//     let settings = new Object()
//     conn.query(`SELECT * FROM users_meta WHERE user_id = ?`, id)
//       .then( rows => {
//         // let settingsObj = new Object()
//         rows.map((s) => {
//           settings[s.meta_name] = s.meta_value
//         })

//         // Return settings
//         res.json({ack:'ok', msg: 'User settings', data: settings});
//       })
//       .catch( err => {
//         let msg = err.sqlMessage ? err.sqlMessage : err
//         res.json({ack:'err', msg})
//       })
  
//   } else {
//     res.json({ack:'err', msg: 'bad parameter'})
//   }
// }
