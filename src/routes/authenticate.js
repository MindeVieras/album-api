
import Authenticate from '../models/authenticate'

export default function authenticateReoutes(app) {

  app.post('/api/authenticate', Authenticate)

}
