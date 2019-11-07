
import AWS from 'aws-sdk'
import { config } from '../../../config'

const rekognition = new AWS.Rekognition()

export function get(key, mime) {

  return new Promise((resolve, reject) => {

    if (mime.includes('image')) {
      const params = {
        Image: {
          S3Object: {
            Bucket: config.aws.bucket,
            Name: key
          }
        }
      }

      rekognition.detectText(params, (err, data) => {
        if (err) {
          reject(err.message)
        } else {
          resolve(data.TextDetections)
        }
      })
    }
    else if (mime.includes('video')) {
      resolve('getting video labels')
      // cb(null, 'ffsfa');
      // var startParams = {
      //   Video: {
      //     S3Object: {
      //       Bucket: config.aws.bucket,
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
      reject('Invalid mime type')
    }
  })
};
