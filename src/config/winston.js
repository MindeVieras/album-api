
import winston from 'winston'
import winston_mysql from 'winston-mysql'

const winston_mysql_options = {
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME,
  table    : 'logs',
  fields   : { level: 'level', meta: 'meta', message: 'type', timestamp: 'timestamp'}
}

const logger = winston.createLogger({
  transports: [
    new winston_mysql(winston_mysql_options)
  ]
})

export default logger
