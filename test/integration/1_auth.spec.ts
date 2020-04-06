import chalk from 'chalk'
// import mongoose from 'mongoose'

import { User, UserDocument } from '../../src/models'

import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'

import Server from '../../src/Server'
chai.use(chaiHttp)

const { app } = new Server()

//Our parent block
describe(chalk.blueBright('Authentication tests\n'), () => {
  let testUser: UserDocument

  /**
   * Create test user.
   */
  const testUserData = {
    username: 'testUser',
    hash: 'password',
  }

  before(async () => {
    const user = new User(testUserData)
    testUser = await user.save()
  })

  after(async () => {
    await User.deleteOne({ username: testUser.username })
  })

  /*
   * Test the /GET route
   */
  describe('Testing /api/auth route', () => {
    it('POST /api/auth should return success on user login', (done) => {
      chai
        .request(app)
        .post('/api/auth')
        .send({ username: testUserData.username, password: testUserData.hash })
        .end((err, res) => {
          expect(res).to.be.json
          expect(res.status).to.equal(200)

          expect(res.body.status).to.equal('SUCCESS')

          // expect(res.body.data).to.be.an('object')
          expect(res.body.data.username).to.equal(testUser.username)
          expect(res.body.data.status).to.equal(testUser.status)
          expect(res.body.data.role).to.equal(testUser.role)

          done()
        })
    })
  })
})

// import 'mocha'
// import * as http from 'http'
// import { expect } from 'chai'
// import { agent as request } from 'supertest'
// import faker from 'faker'

// import Server from '../../src/Server'
// import { databaseSetup, config } from '../../src/config'

// describe('Testing /api/auth route.', () => {
//   // Setup initial server variable.
//   let server: http.Server

//   // Run server before all the tests.
//   before((done) => {
//     server = new Server().app.listen(config.port + 1, done)
//   })

//   /**
//    * Create fake users.
//    */
//   const fakeUser = {
//     username: 'admin',
//     password: 'Password123!',
//   }

//   it('POST /api/auth should return success on user login', async (done) => {
//     const res = await request(Server.baseUrl)
//       .post('/api/auth')
//       .send(fakeUser)

//     console.log(res.body)
//     console.log(server)
//     done()
//     // expect(res.status).to.equal(200)
//     // expect(res.body).not.to.be.empty
//     // expect(res.body.data).not.to.be.empty
//     // expect(res.body.data).to.be.an('object')
//     // expect(res.body.error).to.be.empty
//   })
//   // it('should GET /api/todo', async function() {
//   //   const res = await request(new Server()).get('/api/todo')
//   //   expect(res.status).to.equal(200)
//   //   expect(res.body).not.to.be.empty
//   //   expect(res.body.data).not.to.be.empty
//   //   expect(res.body.data).to.be.an('array')
//   //   expect(res.body.error).to.be.empty
//   // })

//   // Close server after all tests.
//   after((done) => {
//     server.close(done)
//   })
// })
