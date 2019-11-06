
import winston from 'winston'
import winston_mysql from 'winston-mysql'

import { config } from './config'

const winston_mysql_options = {
  host: config.db.host,
  user: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  port: config.db.port,
  table: 'logs',
  fields: { level: 'level', meta: 'meta', message: 'type', timestamp: 'timestamp' }
}

const logger = winston.createLogger({
  transports: [
    new winston_mysql(winston_mysql_options)
  ]
})

export default logger
