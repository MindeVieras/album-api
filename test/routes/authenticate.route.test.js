
import httpStatus from 'http-status-codes'
import request from 'supertest'
import { expect } from 'chai'

import '@babel/polyfill'
import app from '../../src/index'

describe('## Authentication route.', () => {
  describe('# POST /api/authenticate', () => {

    const user = {
      username: 'admin',
      password: 'admin123',
    }

    it('User authenticated successfully.', function (done) {
      request(app)
        .post('/api/authenticate')
        .send(user)
        // .expect(httpStatus.OK)
        .then(res => {
          // console.log(res)
          // expect(res.body.data.name).to.equal(member.name)
          // expect(res.body.data.email).to.equal(member.email)
          // member = res.body.data
          done()
        })
        .catch(done)
    })

  })
})
