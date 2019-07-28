
import { expect } from 'chai'

// import config from '../../src/config/config'
import UserClass from '../../src/classes/UserClass'

describe('Environment configuration tests.', () => {

  it('Configuration should return valid object.', async done => {

    const User = new UserClass()
    const user = await User.load('admin', 1)

    console.log(user)

    done()
  })

})
