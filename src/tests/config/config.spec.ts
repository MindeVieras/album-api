
import 'mocha'
import { expect } from 'chai'

import { config } from '../../config'

describe('Configuration test.', () => {

  it('config object should return valid data', () => {
    expect(config).to.equal(config)
  })

})
