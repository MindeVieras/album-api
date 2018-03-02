
const Albums = require('../models/albums');
const Auth = require('../helpers/authenticate');

module.exports = function(app) {

  app.post('/api/albums/create', Auth.isAuthed, Albums.create);
  app.post('/api/albums/get-list', Auth.isAuthed, Albums.getList);
  app.get('/api/albums/get-list-dates', Auth.isAuthed, Albums.getListDates);
  app.get('/api/albums/get-one/:id', Auth.isAuthed, Albums.getOne);
  app.get('/api/albums/remove-location/:id', Auth.isAuthed, Albums.removeLocation);
  app.post('/api/albums/set-location', Auth.isAuthed, Albums.setLocation);
  app.post('/api/albums/update-location', Auth.isAuthed, Albums.updateLocation);
  app.post('/api/albums/rename', Auth.isAuthed, Albums.rename);
  app.post('/api/albums/change-date', Auth.isAuthed, Albums.changeDate);
  app.delete('/api/albums/move-to-trash/:id', Auth.isAuthed, Albums.moveToTrash);

};