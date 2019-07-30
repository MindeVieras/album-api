
import config from './config'

export default {
  development: {
    database: config.db.name,
    dialect: 'mysql',
    host: config.db.host,
    password: config.db.pass,
    username: config.db.user,
  },
  production: {
    database: config.db.name,
    dialect: 'mysql',
    host: config.db.host,
    password: config.db.pass,
    username: config.db.user,
  },
  test: {
    database: 'album_test',
    dialect: 'sqlite',
    password: config.db.pass,
    storage: 'test.db',
    username: config.db.user,
  },
}
