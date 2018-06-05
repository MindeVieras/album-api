'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.get = get;

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _aspectRatio = require('aspect-ratio');

var _aspectRatio2 = _interopRequireDefault(_aspectRatio);

var _config = require('../../../config/config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.loadFromPath('./aws-keys.json');
var lambda = new _awsSdk2.default.Lambda();
var s3 = new _awsSdk2.default.S3();

function get(key, cb) {

  // Get S3 file metadata from lambda
  var params = {
    FunctionName: 'aws-album_get_image_metadata',
    Payload: '{"srcKey": "' + key + '", "bucket": "' + _config.bucket + '"}'
  };

  lambda.invoke(params, function (err, data) {

    if (err) cb(err.message);

    var payload = JSON.parse(data.Payload);

    if (payload !== null && (typeof payload === 'undefined' ? 'undefined' : _typeof(payload)) === 'object') {

      var meta = new Object();
      // make exif object
      Object.keys(payload.exif).forEach(function (key) {
        if (key == 'DateTimeOriginal') meta.datetime = convertExifDate(payload.exif[key]);
        if (key == 'ExifImageWidth') meta.width = payload.exif[key];
        if (key == 'ExifImageHeight') meta.height = payload.exif[key];
        if (key == 'Flash') meta.flash = payload.exif[key];
        if (key == 'ISO') meta.iso = payload.exif[key];
      });

      // make image object
      Object.keys(payload.image).forEach(function (key) {
        if (key == 'Make') meta.make = payload.image[key];
        if (key == 'Model') meta.model = payload.image[key];
        if (key == 'Orientation') meta.orientation = payload.image[key];
      });
      if (meta.width && meta.height) {
        meta.aspect = (0, _aspectRatio2.default)(meta.width, meta.height);
      }

      cb(null, meta);
    } else {
      // Get presigned url
      var url = s3.getSignedUrl('getObject', {
        Bucket: _config.bucket,
        Key: key,
        Expires: 10
      });
      // console.log(url)
      // Get S3 file metadata from lambda
      var _params = {
        FunctionName: 'aws-album_get_video_metadata',
        Payload: '{"url": "' + url + '"}'
      };

      lambda.invoke(_params, function (err, data) {

        if (err) cb(err);

        var payload = JSON.parse(data.Payload);

        if (payload !== null && (typeof payload === 'undefined' ? 'undefined' : _typeof(payload)) === 'object') {

          var _meta = new Object();

          // make meta object
          payload.streams.forEach(function (row) {
            if (row.width && row.height) {
              _meta.width = row.width;
              _meta.height = row.height;
              _meta.aspect = (0, _aspectRatio2.default)(row.width, row.height);
            }
          });

          cb(null, _meta);
        } else {
          cb('No Meta found');
        }
      });
    }
  });
}

// converts exif date to normal date
function convertExifDate(date) {
  if (date) {
    var newDateTime = void 0;
    var dateTime = date.split(' ');
    var regex = new RegExp(':', 'g');
    dateTime[0] = dateTime[0].replace(regex, '-');
    if (typeof date === 'undefined' || !date) {
      newDateTime = '';
    } else {
      newDateTime = dateTime[0] + ' ' + dateTime[1];
    }
    return newDateTime;
  } else {
    return date;
  }
}
//# sourceMappingURL=get_image_metadata.js.map