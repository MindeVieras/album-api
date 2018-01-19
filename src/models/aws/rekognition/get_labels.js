
const AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-keys.json');
const rekognition = new AWS.Rekognition();
const config = require('../../../config/config');

module.exports.get = function(key, mime, cb){
  if (mime.includes('image')) {  
    var params = {
      Image: {
        S3Object: {
          Bucket: config.bucket, 
          Name: key
        }
      }, 
      MaxLabels: 500,
      MinConfidence: 1
    };

    rekognition.detectLabels(params, function(err, data) {
      if (err) {
        cb(err.message);
      } else {
        cb(null, data.Labels);
      }
    });
  }
  else if (mime.includes('video')) {
    cb(null, 'ffsfa');
    // var startParams = {
    //   Video: {
    //     S3Object: {
    //       Bucket: config.bucket,
    //       Name: key
    //     }
    //   },
    //   MinConfidence: 1
    // };

    // rekognition.startLabelDetection(startParams, function(err, job) {
    //   if (err) {
    //     cb(err);
    //   }
    //   else {
    //     const jobId = job.JobId;
    //     var getParams = {
    //       JobId: jobId,
    //       MaxResults: 1000
    //     };
    //     rekognition.getLabelDetection(getParams, function(err, data) {
    //       if (err) {
    //         cb(err);
    //       }
    //       else {
    //         console.log(data);
    //         cb(null, 'ffsfa');
    //       }
    //     });
    //   }
    // });
    
  }
  else {
    cb('Invalid mime type');
  }
};
