
import mysql from 'mysql'

import config from './config/config'
import logger from './config/winston'

const dbConfig = {
  host: config.db.host,
  user: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  port: config.db.port,
  acquireTimeout: 1000000
}

export class Database {

  constructor() {
    this.connection = mysql.createConnection(dbConfig)
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) {
          // Log db errors
          logger.error('database', err)
          return reject(err)
        }
        resolve(rows)
      })
    })
  }

  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err)
          return reject(err)
        resolve()
      })
    })
  }

}
