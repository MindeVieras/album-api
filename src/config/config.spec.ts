
import 'mocha'
import { expect } from 'chai'

import { config } from './config'

describe('Configuration test.', () => {

  it('should return hello world', () => {
    console.log(config)
    const result = 'Hello world!'
    expect(result).to.equal('Hello world!')
  })

})
