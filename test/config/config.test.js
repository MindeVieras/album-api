
import { expect } from 'chai'

import config from '../../src/config/config'

describe('Environment configuration tests.', () => {

  it('Configuration should return valid object.', function () {
    // Environment value check.
    expect(config).to.have.property('env', 'test')
    expect(config).to.have.property('host', process.env.HOST)
    expect(config).to.have.property('port', parseInt(process.env.PORT))
    expect(config).to.have.property('jwtSecret', process.env.JWT_SECRET)

    // Check database config.
    expect(config).to.have.nested.property('db.name', process.env.DB_NAME)
    expect(config).to.have.nested.property('db.host', process.env.DB_HOST)
    expect(config).to.have.nested.property('db.port', parseInt(process.env.DB_PORT))
    expect(config).to.have.nested.property('db.user', process.env.DB_USER)
    expect(config).to.have.nested.property('db.pass', process.env.DB_PASS)
  })

})
