
import mysql from 'mysql'

import { config } from './config'

const connection = mysql.createConnection({
  host: config.db.host,
  user: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  port: config.db.port
})

connection.connect(err => {
  if (err) console.log(err)
})

module.exports = connection
