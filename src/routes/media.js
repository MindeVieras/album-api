
const Media = require('../models/media');
const Auth = require('../helpers/authenticate');

module.exports = function(app) {

  app.get('/api/media/get-all', Auth.isAuthed, Media.getAll);
  app.post('/api/media/put-to-trash', Auth.isAuthed, Media.putToTrash);
  app.post('/api/media/save-metadata', Auth.isAuthed, Media.saveMetadata);
  app.post('/api/media/save-rekognition-labels', Auth.isAuthed, Media.saveRekognitionLabels);
  app.post('/api/media/generate-image-thumbs', Auth.isAuthed, Media.generateImageThumbs);
  app.post('/api/media/generate-videos', Auth.isAuthed, Media.generateVideos);
};