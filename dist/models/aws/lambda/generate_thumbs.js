'use strict';

var connection = require('../../../config/db');
var path = require('path');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-keys.json');
var lambda = new AWS.Lambda();
var config = require('../../../config/config');

module.exports.generate = function (key, cb) {

  // Firstly get image media styles
  connection.query('SELECT * FROM media_styles', function (err, rows) {

    if (err) throw err;

    var payloadObj = {
      srcKey: key,
      bucket: config.bucket,
      styles: rows
    };

    var params = {
      FunctionName: 'aws-album_generate_thumb',
      Payload: JSON.stringify(payloadObj)
    };

    lambda.invoke(params, function (err, data) {

      if (err) console.log(err);

      // var payload = JSON.parse(data.Payload);
      var thumb = '//s3-eu-west-1.amazonaws.com/' + config.bucket + '/thumbs/medium/' + path.basename(key);
      cb(null, thumb);
    });
  });
};
//# sourceMappingURL=generate_thumbs.js.map