import request from 'supertest'

import Server from '../src/Server'

export class Test {
  public request = request(Server.baseUrl)

  public authAdmin() {
    return this.request.post('/api/auth')
  }
}
