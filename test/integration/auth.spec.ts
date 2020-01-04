import request from 'supertest'
import httpStatus from 'http-status-codes'
import { expect } from 'chai'
import sinon from 'sinon'

// const app = require('../../../index')
// const User = require('../user/user.model')
// const RefreshToken = require('./refreshToken.model')
// const authProviders = require('../../utils/authProviders')

// @ts-ignore
import { checkResponse } from './utiltest'
import Server from '../../src/Server'
import { SeedDefaults } from '../../tools/seeder/Seed'

const sandbox = sinon.createSandbox()

let app = new Server().app

describe('Authentication', () => {
  let adminLogin = {}
  // // let user = {}
  // // let refreshToken

  beforeEach(async () => {
    adminLogin = {
      username: 'admin',
      password: SeedDefaults.password,
    }

    // user = {
    //   email: 'sousa.dfs@gmail.com',
    //   password: '123456',
    //   name: 'Daniel Sousa',
    // }

    // refreshToken = {
    //   token:
    //     '5947397b323ae82d8c3a333b.c69d0435e62c9f4953af912442a3d064e20291f0d228c0552ed4be473e7d191ba40b18c2c47e8b9d',
    //   userId: '5947397b323ae82d8c3a333b',
    //   userEmail: dbUser.email,
    //   expires: new Date(),
    // }

    // await User.remove({})
    // await User.create(dbUser)
    // await RefreshToken.remove({})
  })

  afterEach(() => sandbox.restore())

  describe('POST /api/auth', () => {
    it('should return user document object when username and password matches', async () => {
      const res = checkResponse(
        await request(app)
          .post('/api/auth')
          .send(adminLogin)
          .set('Accept', 'application/json')
          // .timeout({ response: 100000, deadline: 100000 })
          .catch((err) => {
            console.error(err)
            throw err
          }),
      )
      // const res = await request(app)
      //   .post('/api/auth')
      //   .send(adminLogin)
      //   .set('Accept', 'application/json')

      expect(res.body.status).to.be('SUCCESS')

      // 404,
      // {
      //   status: 'CLIENT_ERROR',
      //   message: 'Not Found',
      // },
      // done,

      // try {
      //   // console.log(a)
      //   const user = await request(app)
      //     .post('/api/auth')
      //     .send(adminLogin)
      //     .expect(httpStatus.OK)
      //   // .then((res: any) => {
      //   //   console.log('asdasddadadadddddddsdasdsadsdasdasdd')
      //   //   done()
      //   //   // delete dbUser.password
      //   //   // expect(res.body.token).to.have.a.property('accessToken')
      //   //   // expect(res.body.token).to.have.a.property('refreshToken')
      //   //   // expect(res.body.token).to.have.a.property('expiresIn')
      //   //   // expect(res.body.user).to.include(dbUser)
      //   // })
      //   // .catch((e) => {
      //   //   console.log(e.message)
      //   // })
      //   console.log(user)
      //   done()
      // } catch (e) {
      //   console.log(e)
      // }
    })

    // it('should report error when email and password are not provided', () => {
    //   return request(app)
    //     .post('/v1/auth/login')
    //     .send({})
    //     .expect(httpStatus.BAD_REQUEST)
    //     .then((res) => {
    //       const { field } = res.body.errors[0]
    //       const { location } = res.body.errors[0]
    //       const { messages } = res.body.errors[0]
    //       expect(field).to.be.equal('email')
    //       expect(location).to.be.equal('body')
    //       expect(messages).to.include('"email" is required')
    //     })
    // })

    // it('should report error when the email provided is not valid', () => {
    //   user.email = 'this_is_not_an_email'
    //   return request(app)
    //     .post('/v1/auth/login')
    //     .send(user)
    //     .expect(httpStatus.BAD_REQUEST)
    //     .then((res) => {
    //       const { field } = res.body.errors[0]
    //       const { location } = res.body.errors[0]
    //       const { messages } = res.body.errors[0]
    //       expect(field).to.be.equal('email')
    //       expect(location).to.be.equal('body')
    //       expect(messages).to.include('"email" must be a valid email')
    //     })
    // })

    // it("should report error when email and password don't match", () => {
    //   dbUser.password = 'xxx'
    //   return request(app)
    //     .post('/v1/auth/login')
    //     .send(dbUser)
    //     .expect(httpStatus.UNAUTHORIZED)
    //     .then((res) => {
    //       const { code } = res.body
    //       const { message } = res.body
    //       expect(code).to.be.equal(401)
    //       expect(message).to.be.equal('Incorrect email or password')
    //     })
    // })
  })
})
