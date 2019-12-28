import 'mocha'
import { expect } from 'chai'

import { config } from '../../../src/config'

describe('Configuration test.', () => {
  it('config object should return valid config', () => {
    expect(config).to.be.an('object')
    expect(config.env).to.equal('test')
    expect(config.host).to.be.a('string')
    expect(config.port).to.be.a('number')
    expect(config.locale).to.be.a('string')
    expect(config.jwtSecret).to.be.a('string')
    expect(config.mongodb).to.be.a('string')
    expect(config.aws).to.be.an('object')
    expect(config.aws.region).to.be.a('string')
    expect(config.aws.accessKey).to.be.a('string')
    expect(config.aws.secretKey).to.be.a('string')
    expect(config.aws.bucket).to.be.a('string')
    expect(config.aws.facesCollection).to.be.a('string')
    expect(config.aws.transcoderPipeline).to.be.a('string')
  })
})
