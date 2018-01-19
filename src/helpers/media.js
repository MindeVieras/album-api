
const path = require('path');
const AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-keys.json');
const s3 = new AWS.S3();
const config = require('../config/config');

// Image url helper
exports.img = function(key, size) {
  var thumbKey = 'thumbs/'+size+'/'+path.basename(key);

  var params = {
    Bucket: config.bucket, 
    Key: thumbKey,
    Expires: 60
  };

  var url = s3.getSignedUrl('getObject', params);
  return url;
    
};

// Video url helper
exports.video = function (key, size) {
  
  var videoKey = 'videos/'+size+'/'+path.basename(key);

  var params = {
    Bucket: config.bucket, 
    Key: videoKey,
    Expires: 60
  };

  var url = s3.getSignedUrl('getObject', params);
  return url;
    
};
