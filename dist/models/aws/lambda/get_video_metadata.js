'use strict';

var _aspectRatio = require('aspect-ratio');

var _aspectRatio2 = _interopRequireDefault(_aspectRatio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AWS = require('aws-sdk');

AWS.config.loadFromPath('./aws-keys.json');
var lambda = new AWS.Lambda();
var s3 = new AWS.S3();
var config = require('../../../config/config');

module.exports.get = function (key, cb) {

  // Get presigned url
  var url = s3.getSignedUrl('getObject', {
    Bucket: config.bucket,
    Key: key,
    Expires: 60
  });
  // Get S3 file metadata from lambda
  var params = {
    FunctionName: 'aws-album_get_video_metadata',
    Payload: '{"url": "' + url + '"}'
  };

  lambda.invoke(params, function (err, data) {

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
          meta.frame_rate = eval(row.r_frame_rate);
          meta.codec = row.codec_name;
          if (row.width && row.height) {
            meta.aspect = (0, _aspectRatio2.default)(row.width, row.height);
          }
          if (row.tags && 'creation_time' in row.tags) meta.datetime = row.tags.creation_time;
        }
      });
    }

    cb(null, meta);
  });
};
//# sourceMappingURL=get_video_metadata.js.map