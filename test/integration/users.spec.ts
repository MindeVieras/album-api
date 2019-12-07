import 'mocha'
import { expect } from 'chai'
import { agent as request } from 'supertest'
import faker from 'faker'

import { config } from '../../src/config'
import Server from '../../src/Server'
// import { app } from '../../src'

describe('Testing /api/users/* routes.', () => {
  /**
   * Create fake users.
   */
  const fakeUser = {
    username: faker.internet.userName(),
    password: faker.internet.password(),
  }

  console.log(fakeUser)
  it('POST /api/users should return success (Create User)', async function(done) {
    const res = await request(Server.baseUrl)
      .post('/api/users')
      .send(fakeUser)
      .set(
        'authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTc0OTQ5NTU5fQ.8sFyL52npJbpoDpQQ_xqfvhlexWHhrNVmXNNGAJtGEk',
      )

    console.log(res.body)
    done()
    // expect(res.status).to.equal(200)
    // expect(res.body).not.to.be.empty
    // expect(res.body.data).not.to.be.empty
    // expect(res.body.data).to.be.an('object')
    // expect(res.body.error).to.be.empty
  })
  // it('should GET /api/todo', async function() {
  //   const res = await request(new Server()).get('/api/todo')
  //   expect(res.status).to.equal(200)
  //   expect(res.body).not.to.be.empty
  //   expect(res.body.data).not.to.be.empty
  //   expect(res.body.data).to.be.an('array')
  //   expect(res.body.error).to.be.empty
  // })
})
