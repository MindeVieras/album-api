
import { getList } from '../models/front'
const Auth = require('../helpers/authenticate')

module.exports = function(app) {

  app.get('/api/front/albums/get-list', Auth.isAuthed, getList)

}