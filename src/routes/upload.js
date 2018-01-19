
const path =require('path');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config/config');

const Upload = require('../models/upload');

const Auth = require('../helpers/authenticate');

AWS.config.loadFromPath('./aws-keys.json');

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    serverSideEncryption: 'AES256',
    bucket: config.bucket,
    // metadata: function (req, file, cb) {
    //   cb(null, {fieldName: file.fieldname});
    // },
    key: function (req, file, cb) {
      rand = Math.floor((Math.random() * 9999999) + 1);
      ext = path.extname(file.originalname);
      cb(null, 'media/'+Date.now().toString()+'-'+rand+ext.toLowerCase());
    }
  })

});

module.exports = function(app) {

  app.post('/api/upload', Auth.isAuthed, upload.array('qqfile'), Upload.upload);
  app.get('/api/upload/get-initial-files/:id', Auth.isAuthed, Upload.getInitialFiles);

};
