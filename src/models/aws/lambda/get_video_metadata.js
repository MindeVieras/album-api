
const AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-keys.json');
const lambda = new AWS.Lambda();
const s3 = new AWS.S3();
const config = require('../../../config/config');

module.exports.get = function(key, cb){

  // Get presigned url
  var url = s3.getSignedUrl('getObject', {
    Bucket: config.bucket, 
    Key: key,
    Expires: 60
  });
  // Get S3 file metadata from lambda
  let params = {
    FunctionName: 'aws-album_get_video_metadata',
    Payload: '{"url": "'+url+'"}'
  };

  lambda.invoke(params, function(err, data) {
      
    if (err) cb(err);
    
    var payload = JSON.parse(data.Payload);

    var meta = payload;

    if (payload) {
      var meta = {};

      // make meta object
      payload.streams.forEach(function (row) {
        if (row.codec_type == 'video') {
          meta.width = row.width;
          meta.height = row.height;
          meta.duration = parseFloat(row.duration);
          meta.aspect = row.display_aspect_ratio;
          meta.frame_rate = eval(row.r_frame_rate);
          meta.codec = row.codec_name;
          if (row.tags && 'creation_time' in row.tags) meta.datetime = row.tags.creation_time;
        }
      });
    }
    
    cb(null, meta);

  });

};
