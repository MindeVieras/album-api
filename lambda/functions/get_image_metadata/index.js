
var async = require("async");
var AWS = require("aws-sdk");
var fs = require("fs");

var ExifImage = require('exif').ExifImage;

var s3 = new AWS.S3();

exports.handle = function(e, ctx, cb) {
  var bucket = e['bucket'];
  var srcKey = e['srcKey'];

  async.waterfall([

    function download(next) {
        //Download the image from S3
        s3.getObject({
          Bucket: bucket,
          Key: srcKey
        }, next);
    },

    function getMetadata(response, next) {
      
      try {
        new ExifImage(response.Body, function (error, exifData) {
          if (error)
            console.log('Error: '+error.message);
          else
            console.log(exifData);
            cb(null, exifData);
        });
      } catch (error) {
        console.log('Error: ' + error.message);
      }
    }

  ], function(err) {
      if (err) {
        console.error(
          "Unable to generate thumbnail for '" + bucket + "/" + srcKey + "'" +
          " due to error: " + err
          );
      } else {
        console.log("Created thumbnail for '" + bucket + "/" + srcKey + "'");
      }

      context.done();
    });

};
