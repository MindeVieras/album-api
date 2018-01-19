
const Users = require('../models/users');
const Auth = require('../helpers/authenticate');

module.exports = function(app) {

  app.post('/api/users/create', Auth.isAdmin, Users.create);
  app.get('/api/users/get-list', Auth.isAdmin, Users.getList);
  app.get('/api/users/get-one/:id', Auth.isAdmin, Users.getOne);
  app.delete('/api/users/delete/:id', Auth.isAdmin, Users.delete);

};