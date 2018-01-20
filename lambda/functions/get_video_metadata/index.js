
var fs = require("fs");
var AWS = require("aws-sdk");
var s3 = new AWS.S3();
var ffprobe = require('ffprobe');
var ffprobeStatic = require('ffprobe-static');

exports.handle = function(e, ctx, cb) {
  var url = e['url'];

  ffprobe(url, { path: ffprobeStatic.path }, function (err, data) {
    
    if (err) cb(err);
    
    cb(null, data);
  });
};
