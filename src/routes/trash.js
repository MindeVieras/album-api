
const Trash = require('../models/trash');
const Auth = require('../helpers/authenticate');

module.exports = function(app) {

  app.get('/api/trash/get-list', Auth.isAdmin, Trash.getList);
  app.post('/api/trash/restore/:id', Auth.isAdmin, Trash.restore);
  app.delete('/api/trash/delete/:id', Auth.isAdmin, Trash.delete);

};