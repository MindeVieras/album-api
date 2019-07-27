
const config = require('../../src/config/config.js')

describe('Environment configuration tests.', () => {

  test('Configuration should return valid object.', () => {
    // Environment value check.
    expect(config).toHaveProperty('env', process.env.NODE_ENV)
    expect(config).toHaveProperty('host', process.env.HOST)
    expect(config).toHaveProperty('port', parseInt(process.env.PORT))
    expect(config).toHaveProperty('jwtSecret', process.env.JWT_SECRET)

    // Check database config.
    expect(config).toHaveProperty('db.name', process.env.DB_NAME)
    expect(config).toHaveProperty('db.host', process.env.DB_HOST)
    expect(config).toHaveProperty('db.port', parseInt(process.env.DB_PORT))
    expect(config).toHaveProperty('db.user', process.env.DB_USER)
    expect(config).toHaveProperty('db.pass', process.env.DB_PASS)
  })

})
