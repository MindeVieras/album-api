
import httpStatus from 'http-status-codes'
import request from 'supertest'
import { assert, expect } from 'chai'

import '@babel/polyfill'
import app from '../../src/index'

describe('## Authentication route.', () => {
  describe('# POST /api/authenticate', () => {

    const user = {
      username: 'admin',
      password: 'admin123',
    }

    let userErrMsg, passErrMsg

    it('Admin authentication success and data including token.', done => {
      request(app)
        .post('/api/authenticate')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(httpStatus.OK)
        .end((err, res) => {
          if (err) throw err

          expect(res.body).to.have.property('status', httpStatus.OK)
          expect(res.body).to.have.property('message').to.be.a('string')

          expect(res.body).to.have.nested.property('data.id').to.be.a('number')
          expect(res.body).to.have.nested.property('data.username', 'admin')
          expect(res.body).to.have.nested.property('data.accessLevel', 100)
          expect(res.body).to.have.nested.property('data.token').to.be.a('string')

          global.adminToken = res.body.data.token

          done()
        })
    })

    it('Return error if username does not exist.', done => {
      user.username = 'nonExistingUsername'

      request(app)
        .post('/api/authenticate')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          if (err) throw err

          expect(res.body).to.have.property('status', httpStatus.UNAUTHORIZED)
          expect(res.body).to.have.property('message').to.be.a('string')

          userErrMsg = res.body.message

          done()
        })
    })

    it('Return error if password is wrong.', done => {
      user.username = 'admin'
      user.password = 'wrongPassword'

      request(app)
        .post('/api/authenticate')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          if (err) throw err

          expect(res.body).to.have.property('status', httpStatus.UNAUTHORIZED)
          expect(res.body).to.have.property('message').to.be.a('string')

          passErrMsg = res.body.message

          done()
        })
    })

    it('Error message is the same.', done => {
      assert.strictEqual(userErrMsg, passErrMsg)

      done()
    })

    it('Return validation errors if request body is invalid.', done => {
      request(app)
        .post('/api/authenticate')
        .send({})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(httpStatus.UNPROCESSABLE_ENTITY)
        .end((err, res) => {
          if (err) throw err

          expect(res.body).to.have.property('status', httpStatus.UNPROCESSABLE_ENTITY)
          expect(res.body).to.have.property('message').to.be.a('string')
          expect(res.body).to.have.property('errors').to.be.an('array')

          done()
        })
    })

  })
})
