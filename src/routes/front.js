
const Front = require('../models/front');
const Auth = require('../helpers/authenticate');

module.exports = function(app) {

  app.get('/api/front/albums/get-list', Auth.isAuthed, Front.getList);

};