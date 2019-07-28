
import config from './config'

module.exports = {
  development: {
    username: config.db.user,
    password: config.db.pass,
    database: config.db.name,
    host: config.db.host,
    dialect: 'mysql',
  },
  test: {
    username: config.db.user,
    password: config.db.pass,
    database: 'album_test',
    dialect: 'sqlite',
    storage: 'test.db',
  },
  production: {
    username: config.db.user,
    password: config.db.pass,
    database: config.db.name,
    host: config.db.host,
    dialect: 'mysql',
  },
}
