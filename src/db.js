
import mysql from 'mysql'
import logger from './config/winston'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password : process.env.DB_PASS,
  database: process.env.DB_NAME,
  acquireTimeout: 1000000
}

export class Database {

  constructor() {
    this.connection = mysql.createConnection(dbConfig)
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query( sql, args, (err, rows) => {
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
