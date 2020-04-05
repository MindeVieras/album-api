// // Set test env variables.
// process.env.NODE_ENV = 'test'

import chalk from 'chalk'
// import mongoose from 'mongoose'
// let Book = require('../app/models/book');

import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'

import Server from '../../src/Server'
chai.use(chaiHttp)

const { app } = new Server()

//Our parent block
describe(chalk.blueBright('Users tests\n'), () => {
  /**
   * Create fake users.
   */
  const fakeUser = {
    username: 'admin',
    password: 'Password123!',
  }

  // beforeEach((done) => {
  //   console.log('Before each...')
  //   done()
  //   //Before each test we empty the database
  //   // Book.remove({}, (err) => {
  //   //   done()
  //   // })
  // })
  /*
   * Test the /GET route
   */
  describe('Testing /api/users routes', () => {
    it('GET /api/users should return list of users', (done) => {
      chai
        .request(app)
        .get('/api/users')
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlIjp7ImVtYWlsIjoiSm9oYW5uNzVAZ21haWwuY29tIiwiZGlzcGxheU5hbWUiOiJBZG1pbiB1c2VyIiwibG9jYWxlIjoiZW4ifSwicm9sZSI6ImFkbWluIiwic3RhdHVzIjoiYWN0aXZlIiwidXNlcm5hbWUiOiJhZG1pbiIsImNyZWF0ZWRBdCI6IjIwMjAtMDMtMTRUMTk6MTk6MDUuOTYxWiIsInVwZGF0ZWRBdCI6IjIwMjAtMDMtMTRUMTk6MTk6MDUuOTYxWiIsImxhc3RMb2dpbiI6IjIwMjAtMDMtMzFUMjI6MjQ6MjAuNjMwWiIsImluaXRpYWxzIjoiQVUiLCJpZCI6IjVlNmQyZTI5ODllMGMwMzc1M2Q1YjI3MiIsImlhdCI6MTU4NTc2OTA2M30.zLuYjxklBzQhJ8jSU3GpCt_et9at-kFFEb36nnKNwWM',
        )
        .end((err, res) => {
          expect(res).to.be.json
          expect(res.status).to.equal(200)

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
