
const Auth = require('../models/authenticate');

module.exports = function(app) {

  app.post('/api/authenticate', Auth.authenticate);

};