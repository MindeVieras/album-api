
import '@babel/polyfill'
import httpStatus from 'http-status-codes'
import request from 'supertest'
import { assert, expect } from 'chai'

import app from '../../src/index'

describe('## Users routes.', () => {
  describe('# GET /api/users', () => {

    it('Return list of users.', done => {
      request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${global.adminToken}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          if (err) throw err

          expect(res.body).to.have.property('status', httpStatus.OK)
          expect(res.body).to.have.property('message').to.be.a('string')

          // expect(res.body).to.have.nested.property('data.id').to.be.a('number')
          // expect(res.body).to.have.nested.property('data.username', process.env.ADMIN_USER)
          // expect(res.body).to.have.nested.property('data.accessLevel', 100)
          // expect(res.body).to.have.nested.property('data.token').to.be.a('string')

          done()
        })
    })

  })
})
