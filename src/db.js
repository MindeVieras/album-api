
import mysql from 'mysql'

const host = process.env.DB_HOST || 'localhost'
const user = process.env.DB_USER || 'root'
const pass = process.env.DB_PASS || 'root'
const name = process.env.DB_NAME || 'react_album'

const dbConfig = {
  host: host,
  user: user,
  password : pass,
  database: name,
  acquireTimeout: 1000000
}

export class Database {
  constructor() {
    this.connection = mysql.createConnection( dbConfig )
  }

  query( sql, args ) {
    return new Promise( ( resolve, reject ) => {
      this.connection.query( sql, args, ( err, rows ) => {
        if ( err )
          return reject( err )
        resolve( rows )
      })
    })
  }
  close() {
    return new Promise( ( resolve, reject ) => {
      this.connection.end( err => {
        if ( err )
          return reject( err )
        resolve()
      })
    })
  }
}
