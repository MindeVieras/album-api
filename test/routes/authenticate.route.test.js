
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

    it('User authenticated successfully.', done => {
      request(app)
        .post('/api/authenticate')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        // .expect(httpStatus.OK)
        .end((err, res) => {
          if (err) throw err
          console.log(res)
        })
    })

  })
})
