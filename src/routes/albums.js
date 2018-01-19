
const Albums = require('../models/albums');
const Auth = require('../helpers/authenticate');

module.exports = function(app) {

  app.post('/api/albums/create', Auth.isAuthed, Albums.create);
  app.get('/api/albums/get-list', Auth.isAuthed, Albums.getList);
  app.get('/api/albums/get-one/:id', Auth.isAuthed, Albums.getOne);
  app.post('/api/albums/rename', Auth.isAuthed, Albums.rename);
  app.delete('/api/albums/delete/:id', Auth.isAuthed, Albums.delete);

};