'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.img = img;
exports.video = video;
exports.videoThumb = videoThumb;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _config = require('../config/config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.loadFromPath('./aws-keys.json');
var s3 = new _awsSdk2.default.S3();

var EXPIRE = 600; // 10mins

// Image url helper
function img(key, size) {
  var thumbKey = 'thumbs/' + size + '/' + _path2.default.basename(key);

  var params = {
    Bucket: _config.bucket,
    Key: thumbKey,
    Expires: EXPIRE
  };

  return s3.getSignedUrl('getObject', params);
}

// Video url helper
function video(key, size) {
  var videoKey = 'videos/' + size + '/' + _path2.default.basename(key);

  var params = {
    Bucket: _config.bucket,
    Key: videoKey,
    Expires: EXPIRE
  };

  return s3.getSignedUrl('getObject', params);
}

// Video thumbnail url helper
function videoThumb(key, size) {
  var videoThumbKey = 'videos/thumbs/' + size + '/' + _path2.default.parse(key).name + '-00001.jpg';

  var params = {
    Bucket: _config.bucket,
    Key: videoThumbKey,
    Expires: EXPIRE
  };

  return s3.getSignedUrl('getObject', params);
}
//# sourceMappingURL=media.js.map