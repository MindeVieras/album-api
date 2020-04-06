// Set test env variables.
process.env.NODE_ENV = 'test'

import chalk from 'chalk'
import mongoose from 'mongoose'
// let Book = require('../app/models/book');

import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'

import Server from '../../src/Server'
import { SeedDevUsers } from '../../tools/seeder/seeds'
import { databaseSetup } from '../../src/config'
chai.use(chaiHttp)

const { app } = new Server()

//Our parent block
describe(chalk.blueBright('Initialize the tests...\n'), () => {
  /**
   * Create fake users.
   */
  const fakeUser = {
    username: 'admin',
    password: 'Password123!',
  }

  before(async () => {
    // Make sure to connect to MongoDB before server runs.
    await databaseSetup()

    // Seed dev users to have some initial data.
    // await SeedDevUsers()

    // console.log(devUsers)
  })

  after(async () => {
    // Drop collection after the test.
    await mongoose.connection.db.dropCollection('Users')
  })
  // before((done) => {
  //   databaseSetup()
  //   SeedDevUsers()
  //   // try {
  //   //   // Make sure to connect to MongoDB before server runs.
  //   //   await databaseSetup()

  //   //   await SeedDevUsers()
  //   //   console.log('Before each...')
  //   //   done()
  //   // } catch (error) {
  //   //   done(error)
  //   // }
  //   //Before each test we empty the database
  //   // Book.remove({}, (err) => {
  //   //   done()
  //   // })
  // })

  // before((done) =>
  //   Promise.all([databaseSetup(), SeedDevUsers()]).then(() => {
  //     console.log('Before...')
  //     done()
  //   }),
  // )

  /*
   * Test the /GET route
   */
  describe('Testing /api/auth route', () => {
    it('POST /api/auth should return success on user login', (done) => {
      chai
        .request(app)
        .get('/ping')
        .end((err, res) => {
          expect(res.status).to.equal(200)
          // res.should.have.status(200)
          // res.body.should.be.a('array')
          // res.body.length.should.be.eql(0)
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
