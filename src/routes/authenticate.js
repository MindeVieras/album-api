
import Authenticate from '../models/authenticate'

module.exports = function(app) {

  app.post('/api/authenticate', Authenticate)

}
